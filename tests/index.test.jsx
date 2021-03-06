import 'babel-polyfill'
import index from '../src/index'
import ReactDOM from 'react-dom'
import MultiViews from '../src/containers/MultiViews'
import HandsOnTable from '../src/components/dataPackageView/HandsOnTable'
import LeafletMap from '../src/components/dataPackageView/LeafletMap'
import nock from 'nock'
import * as viewutils from '../src/utils/view'


const mock = nock('https://dp-vix-resource-and-view.com')
              .persist()
              .get('/datapackage.json')
              .replyWithFile(200, './fixtures/dp-vix-resource-and-view/datapackage.json')
              .get('/data/demo-resource.csv')
              .replyWithFile(200, './fixtures/dp-vix-resource-and-view/data/demo-resource.csv')

const mock1 = nock('https://example-geojson.com')
                .persist()
                .get('/datapackage.json')
                .replyWithFile(200, './fixtures/example-geojson/datapackage.json')
                .get('/data/example.geojson')
                .replyWithFile(200, './fixtures/example-geojson/data/example.geojson')


describe('how renderComponentInElement method works', () => {
  ReactDOM.render = jest.fn()

  it('should render MultiViews if element data-type = data-views', () => {
    const divForDataView = {dataset: {type: "data-views"}}
    index.renderComponentInElement(divForDataView)
    expect(ReactDOM.render.mock.calls.length).toEqual(1)
    expect(ReactDOM.render.mock.calls[0][0].type).toEqual(MultiViews)
    expect(ReactDOM.render.mock.calls[0][0].props).toEqual({"dataPackage": {}})
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(divForDataView)
  })

  it('should render HandsOnTable if element data-type = resource-preview', () => {
    viewutils.findResourceByNameOrIndex = jest.fn(() => {
      return {format: 'csv'}
    })
    viewutils.handsOnTableToHandsOnTable = jest.fn(() => 'hTspec')
    const divForResourcePreview = {dataset: {type: "resource-preview", resource: "0"}}
    index.renderComponentInElement(divForResourcePreview)
    expect(ReactDOM.render.mock.calls.length).toEqual(2)
    expect(ReactDOM.render.mock.calls[1][0].type).toEqual(HandsOnTable)
    expect(ReactDOM.render.mock.calls[1][0].props).toEqual({spec: 'hTspec', idx: 0})
    expect(ReactDOM.render.mock.calls[1][1]).toEqual(divForResourcePreview)
  })

  it('should render LeafletMap if element data-type=resource-preview and format=geojson', () => {
    viewutils.findResourceByNameOrIndex = jest.fn(() => {
      return {format: 'geojson', _values: 'values'}
    })
    const divForResourcePreview = {dataset: {type: "resource-preview", resource: "0"}}
    index.renderComponentInElement(divForResourcePreview)
    expect(ReactDOM.render.mock.calls.length).toEqual(3)
    expect(ReactDOM.render.mock.calls[2][0].type).toEqual(LeafletMap)
    expect(ReactDOM.render.mock.calls[2][0].props).toEqual({featureCollection: 'values', idx: 0})
    expect(ReactDOM.render.mock.calls[2][1]).toEqual(divForResourcePreview)
  })
})

describe('how incrementally loading happens', () => {
  it('should render first time after dp is fetched and second time when data is fetched', async () => {
    index.renderComponentInElement = jest.fn()
    const dpUrl = 'https://dp-vix-resource-and-view.com/datapackage.json'
    const divForDataView = {dataset: {type: "view"}}
    const divForResourcePreview = {dataset: {type: "resource"}}
    await index.fetchDataPackageAndDataIncrementally(dpUrl, [divForDataView, divForResourcePreview])
    // there are 1 view and 1 resource - each one renders twice
    expect(index.renderComponentInElement.mock.calls.length).toEqual(4)
    expect(index.renderComponentInElement.mock.calls[0][0]).toEqual(divForDataView)
    expect(index.renderComponentInElement.mock.calls[1][0]).toEqual(divForResourcePreview)
    expect(index.renderComponentInElement.mock.calls[2][0]).toEqual(divForDataView)
    expect(index.renderComponentInElement.mock.calls[3][0]).toEqual(divForResourcePreview)
  })
})

describe('render page for geojson data package', () => {
  it('should render if no view component in datapackage', async () => {
    index.renderComponentInElement = jest.fn()
    const dpUrl = 'https://example-geojson.com/datapackage.json'
    const divForDataView = {dataset: {type: "view"}}
    const divForResourcePreview = {dataset: {type: "resource"}}
    await index.fetchDataPackageAndDataIncrementally(dpUrl, [divForDataView, divForResourcePreview])
    // there are only 1 resource - this one renders twice and render blank view div once
    expect(index.renderComponentInElement.mock.calls.length).toEqual(3)
    expect(index.renderComponentInElement.mock.calls[0][0]).toEqual(divForDataView)
    expect(index.renderComponentInElement.mock.calls[1][0]).toEqual(divForResourcePreview)
    expect(index.renderComponentInElement.mock.calls[2][0]).toEqual(divForResourcePreview)
  })
})
