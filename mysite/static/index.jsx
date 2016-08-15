'use strict';

// PLAN (commentbox)
// Excersizes
// Days

var $ = require("jquery")
var React = require('react')
var ReactDOM = require('react-dom')
import Form from 'grommet/components/Form'
import FormField from 'grommet/components/FormField'
import Tiles from 'grommet/components/Tiles'
import Tile from 'grommet/components/Tile'
import App from 'grommet/components/App'
import Header from 'grommet/components/App'
import Title from 'grommet/components/Title'
import Button from 'grommet/components/Button'
import Edit from 'grommet/components/icons/base/Edit'
import DateTime from 'grommet/components/DateTime'
import Table from 'grommet/components/Table'
import Layer from 'grommet/components/Layer'


var MyApp = React.createClass({
  render: function() {
    return (
      <App>
        <Header pad="large">
          <Title>Fitness Plans</Title>
        </Header>
        <PlanList url="/app/plans/" />,
        <Button label="add plan" />

      </App>
    )
  }
})


var PlanList = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("PlanList AJAX:", data)
        this.setState({data: data.results});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    var plans = this.state.data.map((e) => {
      console.log("adding new plan, rawdata:", e)
      return <Button label={e.title} icon={<Edit />} fill={true} key={e.url} />
    })

    return (
      <Tiles fill={true}>
        <Tile align="start" pad="small">{plans}</Tile>
        <Tile pad="small"><NewForm /></Tile>
      </Tiles>
    )
  }
});


var NewForm = React.createClass({
  getInitialState: function() {
    return {data: [], date: "", show: true};
  },
  getDefaultProps: function() {
    return {
      url: "/app/exercises/"
    };
  },
  show: function() {
    this.setState({show: true})
  },
  hide: function() {
    this.setState({show: false})
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("XXX LOADED", data);
        this.setState({data: data.results});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  onDateChange: function(date, e2, e3) {
    console.log("ON DATE CHANGE:", date, e2, e3, this)
    this.setState({date: date})
  },
  onAddDay: function() {

  },
  onSave: function() {
    this.hide()
  },
  onCancel: function() {
    this.hide()
  },
  render: function() {
    var excersizes = this.state.data.map(function(e) {
      // console.log("EXCERSIZE:", e)
      return <tr key={e.url}><td>{e.name}</td></tr>
    })
    if (!this.state.show) {
      return null
    }
    return (
      <Layer align="left" onClose={this.hide} closer={true}>
        <Form compact={true} pad={{vertical: "large", between: "large"}}>
              <FormField label="Plan Name" htmlFor="item1">
                <input id="item1" type="text" />
              </FormField>
              <Button label="Add Day" onClick={this.onAddDay} />

              <FormField label="Date">
                <DateTime format="M/D/YYYY" value={this.state.date} onChange={this.onDateChange} id="item1" name="item-1" />
              </FormField>

              <FormField label="Excersizes">
                  <Table selectable="multiple">
                    <tbody>
                      {excersizes}
                    </tbody>
                  </Table>
              </FormField>
              <Button label="Save" onClick={this.onSave} />
        </Form>
      </Layer>
    )
  }
});


var Plan = React.createClass({
  getInitialState: function() {
    return {data: {title: "", days: []}};
  },
  handleClick: function() {
    alert("HABA")
  },
  render: function() {
    return (
      <div className="plan" onClick={this.handleClick}>
        <h1>{this.props.title}</h1>
      </div>
    );
  }
});


ReactDOM.render(
  <MyApp />,
  document.getElementById('content')
);
