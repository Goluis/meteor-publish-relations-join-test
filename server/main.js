import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import PublishRelations from 'meteor/cottz:publish-relations'

const intBetweenRange = (min, max) => (
  Math.floor(Math.random() * (max - min) + min)
)

Meteor.users = new Mongo.Collection('users')

const Chatter = {
  Room: new Mongo.Collection('chatter.room'),
  UserRoom: new Mongo.Collection('chatter.userRoom')
}

Meteor.startup(() => {
  // code to run on server at startup
  if (!Chatter.Room.find().count()) {
    let usersCount = 0
    let users = []

    while (usersCount < 10) {
      usersCount ++

      users.push(Meteor.users.insert({name: 'user' + usersCount}))
    }

    let count = 0

    while (count < 10) {
      count ++
      const roomId = Chatter.Room.insert({name: 'Room' + count, count})

      let userRoomCount = 0

      while (userRoomCount < 5) {
        userRoomCount ++
        Chatter.UserRoom.insert({
          roomId,
          userId: users[intBetweenRange(0, users.length)],
          name: `user room ${count} - ${userRoomCount}`
        })
      }
    }
  }
})

Meteor.publish('rooms', function () {
  this.added('users._ids', 'users', {_ids: Meteor.users.find().map(({_id}) => _id)})
  return Chatter.Room.find()
})

PublishRelations('test', function (roomId) {
  if (!roomId)
    return this.ready()

  const users = this.join(Meteor.users)

  this.cursor(Chatter.Room.find({_id: roomId}), function (id, room, changed) {
    // don't call this.cursor again every time that the room change
    if (!changed) {
      this.cursor(Chatter.UserRoom.find({roomId}), function (id, userRoom) {
        users.push(userRoom.userId)
      })
    }
  })

  users.send()
  return this.ready()
})

PublishRelations('test2', function (roomId) {
  if (!roomId)
    return this.ready()

  const users = this.join(Meteor.users)

  this.cursor(Chatter.Room.find({_id: roomId}), {
    added (id, room) {
      this.cursor(Chatter.UserRoom.find({roomId}), function (id, userRoom) {
        users.push(userRoom.userId)
      })
    }
  })

  users.send()
  return this.ready()
})