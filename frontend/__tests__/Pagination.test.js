import {mount} from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import Router from 'next/router';
import Pagination, { PAGINATION_QUERY } from "../components/Pagination";
import {MockedProvider} from "react-apollo/test-utils";

Router.router = {
  push() {},
  prefetch() {},
}

function mokeMocksFor(length) {
  return [
    {
      request: { query: PAGINATION_QUERY },
      result: {
        data: {
          itemsConnection: {
            __typename: 'aggregate',
            aggregate: {
              __typename: 'count',
              count: length
            }
          }
        }
      }
    }
  ];
}


describe('<Pagination />', async () => {
  it('displays a loading message', () => {
    const wrapper = mount(
      <MockedProvider mocks={mokeMocksFor(1)} >
        <Pagination page={1} />
      </MockedProvider>
    );

    const pagination = wrapper.find('[data-test="pagination"]');
    // console.log(pagination.debug());
    expect(wrapper.text()).toContain('Loading...')
    // expect(toJSON(pagination)).toMatchSnapshot()
  });

  it('renders pagination for 18 items', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mokeMocksFor(18)} >
        <Pagination page={1} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.find('.totalPages').text()).toEqual('5');
    const nav = wrapper.find('div[data-test="pagination"]');
    
    // console.log(nav.debug())
    expect(toJSON(nav)).toMatchSnapshot();
  })

  it('disables prev button on first page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mokeMocksFor(18)} >
        <Pagination page={1} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(true);
    expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false);
  });
  it('disables prev button on last page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mokeMocksFor(18)} >
        <Pagination page={5} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false);
    expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(true);
  });

  it('enables all buttons on middle pages', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mokeMocksFor(18)} >
        <Pagination page={3} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false);
    expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false);
  });
});