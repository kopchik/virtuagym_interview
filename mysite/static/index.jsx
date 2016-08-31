'use strict'

var $ = require('jquery')
var React = require('react')
var ReactDOM = require('react-dom')
var Cookies = require('js-cookie')


import App from 'grommet/components/App'
import Header from 'grommet/components/App'
import Title from 'grommet/components/Title'

import Section from 'grommet/components/Layer'
import Tiles from 'grommet/components/Tiles'
import Tile from 'grommet/components/Tile'
import Layer from 'grommet/components/Layer'
import Table from 'grommet/components/Table'

import Form from 'grommet/components/Form'
import LoginForm from 'grommet/components/LoginForm'
import FormField from 'grommet/components/FormField'

import DateTime from 'grommet/components/DateTime'
import Button from 'grommet/components/Button'
import Edit from 'grommet/components/icons/base/Edit'
import Spinning from 'grommet/components/icons/Spinning'
import Notification from 'grommet/components/Notification'
import Animate from 'grommet/components/Animate'

import Checkmark from 'grommet/components/icons/base/Checkmark'


// setup CSRF (from https://docs.djangoproject.com/en/1.10/ref/csrf/)
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", Cookies.get('csrftoken'));
        }
    }
});


var MyApp = React.createClass({
  getInitialState: function() {
    return {notifications: [], authorized: false};
  },
  notify: function(msg) {
    var new_notifications = this.state.notifications.concat(msg)
    this.setState({notifications: new_notifications})
  },
  onNotificationClose: function() {
    this.setState({notifications: []})
  },
  onLogin: function() {
    this.setState({authorized: true})
  },
  componentDidMount: function() {
    this.checkAuth()
  },
  checkAuth: function() {
    $.ajax({
      url: "/app/me/",
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("Plans AJAX:", data)
        this.setState({authorized: true});
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("AUTH ERR", status, err)
      }.bind(this)
    });
  },
  render: function() {
    if (!this.state.authorized) {
      return <MyLoginForm onLogin={this.checkAuth} />
    }

    var notifications = this.state.notifications.map((e) =>
      <Notification key={1} message={e} status="critical" size="small" closer={true} onClose={this.onNotificationClose} />
    )

    return (
      <App inline={true}>
        <Header direction="row" large={true} pad="large">
          <Title>Fitness Plans</Title>
        </Header>
        <Section pad={{horizontal: 'medium'}}>
        <Animate enter={{"animation": "fade", "duration": 300}} visible={true}>
          {notifications}
        </Animate>
        <Plans app={this} />
        </Section>
      </App>
    )
  }
})


var MyLoginForm = React.createClass({
  getInitialState: function() {
    return {errors: []};
  },
  onSubmit: function(params) {
    console.log("SUBMIT", params)
    $.post({
      url: "/app/me/",
      dataType: 'json',
      data: params,
      cache: false,
      success: function(data) {
        console.log("Plans AJAX:", data)
        this.setState({errors: []});
        this.props.onLogin()
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({errors: [`AJAX failed:${status} ${err.toString()}`]})
      }.bind(this)
    });
  },
  render: function() {
    console.log("ERRORS", this.state.errors)
    return (
      <Layer closer={false} align="top">
        <LoginForm usernameType='text'
                   title="Ho-ho! Someone is yet to login!"
                   onSubmit={this.onSubmit}
                   errors={this.state.errors} />
      </Layer>
    )
    // return(
    //        <Layer closer={false} align="top">
    //         <Form>
    //           <FormField htmlFor='username'>
    //             <input id="username" type="text" />
    //           </FormField>
    //           <FormField htmlFor='password'>
    //             <input id="password" type="password" />
    //           </FormField>
    //           <Button label="Login" primary={true} strong={true} onClick={this.onSubmit} />
    //         </Form>
    //        </Layer>
    //        )
  }
})


var Plans = React.createClass({
  getInitialState: function() {
    return {data: [], edit: false, create: false};
  },
  getDefaultProps: function() {
    return {url: "/app/plans"}
  },
  getData: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("Plans AJAX:", data)
        this.setState({data: data.results});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        notifications.push(`AJAX failed:${status} ${err.toString()}`)
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.getData()
  },
  onPlanEdit: function(plan) {
    console.log("onEdit", plan)
    this.setState({edit: plan})
  },
  onPlanAdd: function() {
    this.setState({create: true})
  },
  onEditorSave: function(plan) {
    this.getData()
    this.setState({edit: false, create: false})
  },
  onEditorCancel: function() {
    this.setState({edit: false, create: false})
  },
  render: function() {
    var editor;
    if (this.state.edit) {
      editor = <Editor data={this.state.edit} onSave={this.onEditorSave} onCancel={this.onEditorCancel} />
    } else if (this.state.create) {
      editor = <Editor onSave={this.onEditorSave} onCancel={this.onEditorCancel} />
    } else {
      editor = null;
    }

    var plans = this.state.data.map((e) => {
      var onClickHandler = () => this.onPlanEdit(e)
      return <Button label={e.title} icon={<Edit />} fill={true} key={e.url} onClick={onClickHandler} />
    })

    return (
      <Form>
        <FormField label="Plans">
          <Tiles fill={true}>
            <Tile align="start" pad="small">
              {plans}
              {editor}
            </Tile>
          </Tiles>
        </FormField>
        <FormField>
          <Button label="Add Plan" onClick={this.onPlanAdd} />
        </FormField>
      </Form>
    )
  }
});


var emptyPlan = {url: null, title: "", days: []}
var Editor = React.createClass({
  getInitialState: function() {
    return {data: null, excersizes: [], date: ""};
  },
  getDefaultProps: function() {
    return {data: null, excersizes_url: "/app/exercises/", plans_url: "/app/plans/"}
  },
  componentDidMount: function() {
    this.getExcersizes()
    if (this.props.data) {
      this.setState({data: this.props.data})
    } else {
      this.createNewPlan()
    }
  },
  createNewPlan: function() {
    $.post({
      url: this.props.plans_url,
      dataType: 'json',

      data: {title: "<new plan>", days: [1]},
      headers: {
        "Authorization": "Basic " + window.btoa("user:password"),
      },
      success: function(data) {
        this.setState({data: data.results});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("cannot create new plan:", status, err.toString());
      }.bind(this)
    });
  },
  onDateChange: function(date, e2) {
    console.log("ON DATE CHANGE:", date, e2, this)
    this.setState({date: date})
  },
  onDayAdd: function() {
    TODO
  },
  getExcersizes: function() {
    $.ajax({
      url: this.props.excersizes_url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({excersizes: data.results});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("cannot get excersizes:", status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    // data not loaded yet, show spinning wheel
    if (!this.state.data) {
      return (
        <Layer align="left" onClose={this.hide} closer={true}>
          <Spinning />
        </Layer>
      )
    }

    var excersizes = this.state.excersizes.map(function(e) {
      return <tr key={e.url}><td>{e.name}</td></tr>
    })
    var days = this.state.data.days.map((day) => <tr key={day.url}><td>{day.date}</td></tr>)
    var title = title = this.state.data.title
    var saveIcon = <Checkmark colorIndex="brand" />

    return (
      <Layer align="left" onClose={this.hide} closer={true}>
        <Form compact={true} pad={{vertical: "large", between: "large"}}>
              <FormField label="Plan Name" htmlFor="item1">
                <input id="item1" type="text" />
              </FormField>
              <FormField>
              <FormField label="days">
                <Table selectable={true}>
                  <tbody>
                    {days}
                  </tbody>
                </Table>
              </FormField>
                <Button label="Add Day" onClick={this.onDayAdd} />
              </FormField>
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
              <FormField>
                <Button label="Save" icon={saveIcon} onClick={this.props.onSave} />
                <Button label="Delete" icon={saveIcon} onClick={this.props.onDelete} />
                <Button label="Cancel" onClick={this.props.onCancel} />
              </FormField>
        </Form>
      </Layer>
    )
  }
});


ReactDOM.render(
  <MyApp />,
  document.getElementById('content')
);
