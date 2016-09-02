'use strict'

var $ = require('jquery')
var React = require('react')
var ReactDOM = require('react-dom')
var Cookies = require('js-cookie')
var update = require('react-addons-update');
var moment = require('moment');

/* SELECTIVE IMPORT TO SAVE SOME SPACE :) */
// top-level widgets
import App from 'grommet/components/App'
import Header from 'grommet/components/App'
import Title from 'grommet/components/Title'
import Animate from 'grommet/components/Animate'

// layout
import Section from 'grommet/components/Layer'
import Layer from 'grommet/components/Layer'

// forms and containers
import Table from 'grommet/components/Table'
import Tiles from 'grommet/components/Tiles'
import Tile from 'grommet/components/Tile'
import Form from 'grommet/components/Form'
import LoginForm from 'grommet/components/LoginForm'
import FormField from 'grommet/components/FormField'
import Box from 'grommet/components/Box'
import List from 'grommet/components/List'
import ListItem from 'grommet/components/ListItem'

// individual widgets
import DateTime from 'grommet/components/DateTime'
import Button from 'grommet/components/Button'
import Spinning from 'grommet/components/icons/Spinning'
import Notification from 'grommet/components/Notification'
import Value from 'grommet/components/Value'

// icons
import Checkmark from 'grommet/components/icons/base/Checkmark'
import Close from 'grommet/components/icons/base/Close'
import Edit from 'grommet/components/icons/base/Edit'
import Add from 'grommet/components/icons/base/Add'


// TODO: 'import as' does not work with my babel, hence manual aliasing
var CloseIcon = Close
var AddIcon  = Add
var CheckmarkIcon = Checkmark

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
  /* Displays notification. */
  notify: function(msg) {
    var new_notifications = this.state.notifications.concat(msg)
    this.setState({notifications: new_notifications})
  },
  onNotificationClose: function(msg) {
    var new_notifications = this.state.notifications.filter((e) => e!=msg)
    this.setState({notifications: new_notifications})
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
      <Notification key={e} message={e} status="critical" size="small" closer={true} onClose={() => this.onNotificationClose(e)} />
    )

    return (
      <App inline={true}>
        <Header direction="row" large={true} pad="large">
          <Title>Fitness Plans</Title>
        </Header>
        <Section pad={{horizontal: 'medium'}}>
        <Animate enter={{"animation": "fade", "duration": 100}} leave={{"animation": "slide", "duration": 100}}>
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
        this.setState({errors: []});
        this.props.onLogin()
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({errors: [`AJAX failed:${status} ${err.toString()}`]})
      }.bind(this)
    });
  },
  render: function() {
    return (
      <Layer closer={false} align="top">
        <LoginForm usernameType='text'
                   title="Ho-ho! Someone is yet to login!"
                   onSubmit={this.onSubmit}
                   errors={this.state.errors} />
      </Layer>
    )
  }
})


var Plans = React.createClass({
  getInitialState: function() {
    return {data: [], edit: false, create: false};
  },
  getDefaultProps: function() {
    return {url: "/app/plans/"}
  },
  getData: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data.results});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        notifications.push(`AJAX failed:${status} ${err.toString()}`)
      }.bind(this)
    });
  },
  componentWillMount: function() {
    this.getData()
  },
  onPlanEdit: function(plan) {
    console.log("onEdit", plan)
    this.setState({edit: plan})
  },
  onPlanAdd: function() {
    this.setState({create: true})
  },
  onPlanDelete: function(plan_url) {
    $.ajax({
      url: plan_url,
      type: 'DELETE',
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("Plans AJAX:", data)
        this.getData()
      }.bind(this),
      error: function(xhr, status, err) {
        this.props.app.notify(`AJAX failed: ${status} ${err.toString()} (${plan_url})`)
      }.bind(this)
    });

  },
  onEditorSave: function(plan) {
    this.getData()
    this.setState({edit: false, create: false})
  },
  onEditorCancel: function() {
    this.setState({edit: false, create: false})
  },
  render: function() {
    var editor = null;
    if (this.state.edit) {
      editor = <Editor onSave={this.onEditorSave} onCancel={this.onEditorCancel} plan={this.state.edit} />
    } else if (this.state.create) {
      editor = <Editor onSave={this.onEditorSave} onCancel={this.onEditorCancel} />
    }

    var planlist = this.state.data.map((e) => {
      var onClickHandler = () => this.onPlanEdit(e)
      return (
        <tr key={e.url}>
          <td>
            <Button label={e.title} icon={<Edit />} fill={true} onClick={onClickHandler} />
          </td>
          <td>
            <Button icon={<CloseIcon />} fill={true} onClick={() => this.onPlanDelete(e.url)} />
          </td>
        </tr>
      )
    })
    if (planlist.length === 0) {
      planlist = (<tr><td colSpan={2}><Value value="No Plans, but you can add one..." colorIndex="status-4" /></td></tr>)
    }

    return (
      <Table>
        <tbody>
          {planlist}
          <tr><td>{editor}</td></tr>
          <tr><td><Button label="add plan" icon={<AddIcon />} onClick={this.onPlanAdd} /></td></tr>
        </tbody>
      </Table>
    )
  }
});


// TODO: too big component
var Editor = React.createClass({
  getInitialState: function() {
    var emptyPlan = {url: null, title: "<Your new plan name>", days: [this.getNewDay()]}
    return {plan: emptyPlan, cur_day: 0, is_new: true, exercises: [], cur_exercises: [], exercisesMap: {}};
  },
  getDefaultProps: function() {
    return {plan: null, exercises_url: "/app/exercises/", new_plan_url: "/app/plans/"}
  },
  componentWillMount: function() {
    this.getExcersizes()
    console.log("WILL MOUNT")
    if (this.props.plan) {
      this.setState({plan: this.props.plan, is_new: false})
    }
  },
  /*  Returns deep copy of the state.
      A dirty hack to dramatically ease development with react.
      React-addons-update is too cumbersome.  */
  cloneState: function () {
    return $.extend(true, {}, this.state)
  },
  onDayNameChange: function(ev) {
    var new_day_name = ev.target.value
    var cur_day = this.state.cur_day
    var new_state = $.extend(true, {}, this.state)
    new_state.plan.days[cur_day].name = new_day_name
    this.setState(new_state)
  },
  getNewDay: function() {
    var today = moment().format('YYYY-MM-DD');
    return {date: today, name: "(New Day)", exercises: []}
  },
  onDateChange: function(new_date) {
    console.log(new_date)
    var cur_day = this.state.cur_day
    var new_state = $.extend(true, {}, this.state)
    new_state.plan.days[cur_day].date = new_date
    this.setState(new_state)
  },
  onTitleChange: function(ev) {
    var new_title = ev.target.value
    this.setState({plan: update(this.state.plan, {title: {$set: new_title}})})
  },
  onDayAdd: function() {
    var new_day = this.getNewDay()
    var new_state = this.cloneState()
    var len = new_state.plan.days.push(new_day)
    new_state.cur_day = len - 1
    this.setState(new_state)
  },
  onDaySelect: function(i) {
    var day = this.state.plan.days[i]
    var all_exercises = this.state.exercises
    function myIndexOf(exercise, all_exercises) {
      for (var i = 0; i < all_exercises.length; i++) {
        var other_excersise = all_exercises[i]
        if (exercise.name === other_excersise.name) {
          return i
        }
      }
      return -1
    }
    var cur_exercises = day.exercises.map((e) => myIndexOf(e, all_exercises))
    console.log("SELECT DAY", i,  this.state.exercises, "cur:", day.exercises, cur_exercises)
    this.setState({cur_day: i, cur_exercises: cur_exercises})
  },
  onExcersizeSelect: function(cur_exercises) {
    console.log("EXERC", cur_exercises)
    if (!Array.isArray(cur_exercises)) {
      cur_exercises = [cur_exercises]
    }
    var day_exercises = cur_exercises.map((i) => this.state.exercises[i].url)
    var new_state = this.cloneState()
    var cur_day = this.state.cur_day
    new_state.plan.days[cur_day].exercises = day_exercises
    new_state.cur_exercises = cur_exercises
    this.setState(new_state)
  },
  onSave: function() {
    var url, method
    if (this.state.is_new) {
      url = this.props.new_plan_url
      method = "POST"
    } else {
      url = this.state.plan.url
      method = "PUT"

    }

    console.log(url, this.state.plan)
    $.ajax({
      url: url,
      method: method,
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(this.state.plan),
      success: function(data) {
        this.setState({is_new: false})
        this.props.onSave()
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("cannot create new plan:", status, err.toString());
      }.bind(this)
    });
  },
  getExcersizes: function() {
    $.ajax({
      url: this.props.exercises_url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        var exercices = data.results
        var exercisesMap = {}
        exercices.forEach((e)=>exercisesMap[e.url] = e.name)
        this.setState({exercises: data.results, exercisesMap: exercisesMap});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("cannot get exercises:", status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    console.log("RENDER")
    var plan = this.state.plan
    var cur_day = this.state.cur_day
    var exercises = this.state.exercises
    var cur_exercises = this.state.cur_exercises

    return (
      <Layer align="center" flush={true}>
        <Table><tbody>
          <tr>
            {/* LIST OF DAYS */}
            <td>
              <List selectable={true} onSelect={this.onDaySelect}>
                {plan.days.map((day, idx) =>
                  <DayWidget key={idx} day={day} exercisesMap={this.state.exercisesMap} />)}
              </List>
            </td>

            {/* PLAN FORM */}
            <td>
              <Form pad="none" compact={true}>
                <FormField label="Plan Name" htmlFor="title">
                  <input type="text" ref="title" value={plan.title} onChange={this.onTitleChange} />
                </FormField>

                <FormField label="Day Name" htmlFor="day_name">
                  <input type="text" ref="day_name" value={plan.days[cur_day].name} onChange={this.onDayNameChange} />
                </FormField>

                <FormField label="Date">
                  <DateTime format="YYYY-MM-DD" value={plan.days[cur_day].date} onChange={this.onDateChange} id="item1" name="item-1" />
                </FormField>

                <FormField label="Excersizes (Shift/Ctrl to select multiple)">
                    <Table selectable="multiple" onSelect={this.onExcersizeSelect} selected={cur_exercises}>
                      <tbody>
                        {exercises.map((e) => <tr key={e.url}><td>{e.name}</td></tr>)}
                      </tbody>
                    </Table>
                </FormField>

                <FormField>
                  <Box pad="small" justify="center" direction="row">
                    <Button label="Add New Day" onClick={this.onDayAdd} />
                  </Box>
                </FormField>

                <FormField>
                  <Box justify="center" pad={{between: "small"}} direction="row">
                    <div>
                      <Button label="Cancel" onClick={this.props.onCancel} />
                    </div>
                    <div>
                      <Button label="Save" icon={<CheckmarkIcon />} onClick={this.onSave} />
                    </div>
                  </Box>
                </FormField>
              </Form>
            </td>
          </tr>
        </tbody></Table>
      </Layer>
    )
  }
});


class DayWidget extends React.Component {
  render() {
    var day = this.props.day
    var excersizesWidget = <div>{"(no exersices yet)"}</div>
    if (day.exercises.length > 0) {
      excersizesWidget = (
        <ul>
          {day.exercises.map((id, i) =>
            <li key={id}>{this.props.exercisesMap[id]}</li>)}
        </ul>
      )
    }

    return (
      <ListItem>
      <Box align="start">
          {/* TODO: dirty hack to avoid too much shrinking */}
          <div style={{minWidth: "200px"}}>
            <b>{`[${day.date}] ${day.name}`}</b>
          </div>
          {excersizesWidget}
      </Box>
      </ListItem>
    )
  }
}


ReactDOM.render(
  <MyApp />,
  document.getElementById('content')
);
