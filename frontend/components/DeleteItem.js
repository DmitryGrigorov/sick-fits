import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { ALL_ITEMS_QUERY } from './Items';

const DELETE_ITEM_MUTATION = gql`
    mutation DELETE_ITEM_MUTATION($id: ID!) {
        deleteItem(id: $id) {
            id
        }
    }
`;

export class DeleteItem extends Component {
  update = (cashe, payload) => {
    // manually update the cashe on the client so this matches the server
    // 1. Read the cashe for the items want
    const data = cashe.readQuery({ query: ALL_ITEMS_QUERY })
    // 2. Filter the deleted item out of the page
    data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id);
    // 3. Put the Items back!
    cashe.writeQuery({ query: ALL_ITEMS_QUERY, data })
  }

  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
      >
      {(deleteItem, {error}) => (
        <button
          onClick={() => {
            if(confirm('Are you sure you want to delete this item?')) {
              deleteItem().catch(err => {
                alert(err.message)
              })
            }
          }}
        >
          {this.props.children}
        </button>
      )}
      </Mutation>
    )
  }
}

export default DeleteItem
