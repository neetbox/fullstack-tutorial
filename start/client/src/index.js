import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider, Query } from 'react-apollo';
import React from 'react';
import ReactDOM from 'react-dom';
import Pages from './pages';
import Login from './pages/login';
import injectStyles from './styles';
import { gql } from 'graphql-tag';
import { typeDefs, resolvers } from './resolvers';

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: {
      authorization: localStorage.getItem('token'),
    },
  }),
  resolvers,
  typeDefs,
});

const IS_LOGGED_IN = gql`
 query IsUserLoggedIn {
   isLoggedIn @client
 }
`;

cache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem('token'),
    cartItems: [],
  },
});

injectStyles();
ReactDOM.render(
  <ApolloProvider client={client}>
    <Query query={IS_LOGGED_IN}>
      {({ data }) => (
        data.isLoggedIn
          ? <Pages />
          : <Login />
      )}
    </Query>
  </ApolloProvider>,
  document.getElementById('root'),
);
