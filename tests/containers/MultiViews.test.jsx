import 'babel-polyfill'
import React from 'react'
import { shallow } from 'enzyme'
import toJson from 'enzyme-to-json'

import { MultiViews } from '../../src/containers/MultiViews'

const mockDescriptor = {
  name: 'demo-package'
  , resources: [
    {
      name: 'demo-resource'
      , path: 'data/demo-resource.csv'
      , format: 'csv'
      , mediatype: 'text/csv'
      , schema: {
        fields: [
          {
            name: 'Date'
            , type: 'date'
            , description: ''
          }
          , {
            name: 'Open'
            , type: 'number'
            , description: ''
          }
          , {
            name: 'High'
            , type: 'number'
            , description: ''
          }
        ]
        , primaryKey: 'Date'
      }
      , _values: [
        ['2014-01-01', 14.32, 14.59]
        , ['2014-01-02', 14.06, 14.22]
        , ['2014-01-05', 13.41, 14.00]
      ]
    }
  ]
  , views: [
    {
      id: 'Graph'
      , type: 'Graph'
      , state: {
        graphType: 'lines'
        , group: 'Date'
        , series: ['High']
      }
    }
    , {
      name: 'graph'
      , specType: 'simple'
      , spec: {
        type: 'line'
        , group: 'Date'
        , series: ['High']
      }
    }
  ]
}

describe('MultiViews Container', () => {
  it('should render PlotlyChart component', () => {
    const wrapper = shallow(<MultiViews dataPackage={mockDescriptor} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('should render empty PlotlyChart if there is no data yet', () => {
    delete mockDescriptor.resources[0]._values
    const wrapper = shallow(<MultiViews dataPackage={mockDescriptor} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('should NOT render PlotlyChart if there is no views given', () => {
    delete mockDescriptor.views
    const wrapper = shallow(<MultiViews dataPackage={mockDescriptor} />)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
