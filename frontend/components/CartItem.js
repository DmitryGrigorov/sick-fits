import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import formatMoney from '../lib/formatMoney';
import RemoveFromCart from '../components/RemoveFromCart'

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${ props => props.theme.lightgrey };
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3, p {
    margin: 0;
  }
`;

const CartItem = ({ cartItem }) => {
  if(!cartItem.item) return <CartItemStyles>
    <h3>This item has been removed</h3>
    <RemoveFromCart id={cartItem.id} />
  </CartItemStyles>
  return (
    <CartItemStyles>
       <img width="100" src={cartItem.item.image} alt="props.title"/>
       <div className="cart-item-details">
        <h3>{cartItem.item.title}</h3>
        <p>
          {formatMoney(cartItem.item.price * cartItem.quantity)}
          {' – '}
          <em>
            {cartItem.quantity} &times; {formatMoney(cartItem.item.price)} each
          </em>
        </p>
       </div>
       <RemoveFromCart id={cartItem.id} />
    </CartItemStyles>
  );
}

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired
}

export default CartItem;