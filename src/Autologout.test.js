import React from 'react';
import Autologout from './Autologout';
import { render } from 'enzyme';

describe('Autologout', () => {
  const props = {
    children: jest.fn(() => () => ({})),
  };

  it('renders', () => {
    render(<Autologout {...props} />);
  });
});
