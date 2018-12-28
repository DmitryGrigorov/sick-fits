import {mount} from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import RequestReset, { REQUEST_RESET_MUTATION } from "../components/RequestReset";
import {MockedProvider} from "react-apollo/test-utils";
import { wrap } from "module";

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: {
        email: 'dimongrigorov1995@gmail.com'
      }
    },
    result: {
      data: {
        requestReset: { message: 'success', __typename: 'Message' }
      }
    }
  }
]

describe('<ReaquestReset />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );

    // console.log(wrapper.debug())
    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  })

  it('calls the mutation', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );

    // simulate typing an email
    wrapper.find('input').simulate('change', { target: { name: 'email', value: 'dimongrigorov1995@gmail.com' } });
    // submit the form
    wrapper.find('form').simulate('submit');
    // console.log(wrapper.find('form').debug());
    await wait();
    wrapper.update();
    expect(wrapper.find('p').text()).toContain('Success! Check your email for a reset link!');
    expect(toJSON(wrapper.find('p'))).toMatchSnapshot();
  })
});