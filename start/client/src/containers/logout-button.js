import React from 'react';
// import styled from 'react-emotion';
import { ApolloConsumer } from 'react-apollo';

// import { menuItemClassName } from '../components/menu-item';
import { ReactComponent as ExitIcon } from '../assets/icons/exit.svg';

export default function LogoutButton() {
  return (
    <ApolloConsumer>
      {client => (
        <button
          onClick={() => {
            client.writeData({ data: { isLoggedIn: false } });
            localStorage.clear();
          }}
        >
          <ExitIcon />
          Logout
        </button>
      )}
    </ApolloConsumer>
  );
}
