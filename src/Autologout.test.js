import React from 'react';
import Autologout from './Autologout';
import { mount } from 'enzyme';

describe('Autologout', () => {
  const props = {
    children: jest.fn(() => (<div />)),
  };

  beforeEach(() => {
    global.addEventListener = jest.fn();
  });

  it('renders', () => {
    mount(<Autologout {...props} />);
  });
});
