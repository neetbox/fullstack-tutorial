const { paginateResults } = require("./utils");

module.exports = {
  Query: {
    launches: async (_1, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      allLaunches.reverse();

      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      });

      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        hasMore: launches.length
          ? // last item of launches !== last item of all launches
            launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : // otherwise
            false
      };
    },

    // the 2nd argument delivers the graph's argument
    launch: (_1, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),

    me: async (_1, _2, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser()
  },

  Mission: {
    // args[0] -> the mission object passed by the datasource
    // args[1] -> the argument through from the graph
    missionPatch: (mission, { size } = { size: "LARGE" }) => {
      return size === "SMALL"
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    }
  },

  Launch: {
    isBooked: async (launch, _, { dataSources }) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id })
  },

  User: {
    trips: async (_1, _2, { dataSources }) => {
      // get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();

      if (!launchIds.length) return [];

      // look up those launches by their ids
      return (
        dataSources.launchAPI.getLaunchesByIds({
          launchIds
        }) || []
      );
    }
  },

  Mutation: {
    login: async (_1, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser({ email });

      if (user) {
        return Buffer.from(email).toString("base64");
      }
    },

    bookTrips: async (_, { launchIds }, { dataSources }) => {
      const results = await dataSources.userAPI.bookTrips({ launchIds });
      const launches = await dataSources.launchAPI.getLaunchesById({
        launchIds
      });

      return {
        success: results && results.length === launches.lenght,
        message:
          results.length === launchIds.length
            ? "trips booked successfully"
            : `the following launches couldn't be booked: ${launchIds.filter(
                id => !results.includes(id)
              )}`,
        launches
      };
    },

    cancelTrip: async (_, { launchId }, { dataSources }) => {
      const result = dataSources.userAPI.cancelTrip({ launchId });

      if (!result) {
        return {
          success: false,
          message: "failed to cancel trip"
        };
      }

      const launch = await dataSources.launchAPI.getLaunchById({ launch });

      return {
        success: true,
        message: "trip cancelled",
        launches: [launch]
      };
    }
  }
};
