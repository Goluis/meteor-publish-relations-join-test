import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'
import { Template } from 'meteor/templating'
import './main.html';

const intBetweenRange = (min, max) => (
  Math.floor(Math.random() * (max - min) + min)
)

let users = []
Meteor.users = new Mongo.Collection('users')
UsersIds = new Mongo.Collection('users._ids')

Chatter = {
  Room: new Mongo.Collection('chatter.room'),
  UserRoom: new Mongo.Collection('chatter.userRoom')
}

Tracker.autorun(c => {
  if (Meteor.subscribe('rooms').ready()) {
    if (!users.length)
      users = UsersIds.findOne('users')._ids
    if (Chatter.UserRoom.find().count())
      c.stop()
  }
})

addUserRoom = function (roomId) {
  const count = Chatter.UserRoom.find().count()
  const room = Chatter.Room.findOne({_id: roomId})

  const userRoom = {
    roomId,
    userId: users[intBetweenRange(0, users.length)],
    name: `user room ${room.count} - ${count + 1}`
  }

  const userRoomId = Chatter.UserRoom.insert(userRoom)

  console.log('userRoom added: ', {_id: userRoomId, ...userRoom})
}

removeUserRoom = function (_id) {
  const userRoom = Chatter.UserRoom.findOne({_id})
  if (!userRoom)
    return console.log('subscribe first!')

  console.log('removing the userRoom: ' + userRoom)

  Chatter.UserRoom.remove({_id: userRoom._id})
}

Template.home.helpers({
  users () {
    return Meteor.users.find()
  },
  rooms () {
    return Chatter.Room.find()
  },
  userRooms () {
    return Chatter.UserRoom.find({roomId: this._id})
  },
  roomUser () {
    return Meteor.users.find({_id: this.userId})
  }
})

Template.home.events({
  'click #addUserRoom' () {
    addUserRoom(this._id)
  },
  'click #removeUserRoom' () {
    removeUserRoom(this._id)
  }
})