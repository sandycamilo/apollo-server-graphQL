const { ApolloServer, gql, PubSub } = require('apollo-server');
const pubsub = new PubSub(); // used for subscriptions 

// subscription returns a post type 
// schema  
const typeDefs = gql`
	type Post {
		message: String!
		date: String!
	}

  type Channel {
    channelName: String!
    channelPosts: [Post!]!
  }

	type Query {
		posts(channelName: String!): [Post!]
    channels(channelName: String!): [Channel!]
	}

	type Mutation {
		addPost(channelName: String!, message: String!): Post!
    addChannel(channelName: String!): Channel!
	}

	type Subscription {
		newPost(channelName: String!): Post!
    newChannel: Channel!
	}
`
// mock up data 
const data = [
  { channel1: 'drinks', posts: [
    { message: 'milk', 
      date: new Date()
    },
    { message: 'tea',
      date: new Date()
    }
  ] },
  { channel2: 'pets', posts: [
    { message: 'dog', 
      date: new Date()
    },
    { message: 'cat',
      date: new Date()
    }
  ] }
]

// resolvers 
const resolvers = {
	Query: {
		posts: () => {
			return data
		},
    channels: () => {
      return data
    }
	},
	Mutation: {
		addPost: (_,{ message }) => {
      const post = { message, date: new Date() }
      data.push(post)
      pubsub.publish('NEW_POST', { newPost: post }) //Publish!
      return post
    },
    addChannel: (_, { channelName }) => {
      const channel = { channelName, channelPosts }
      data.push(channel)
      pubsub.publish('NEW_CHANNEL', { newChannel: channel })
      return channel
    }
	},
	Subscription: {
		newPost: {
			subscribe: () => pubsub.asyncIterator('NEW_POST')
		},
    newChannel: {
      subscribe: () => pubsub.asyncIterator('NEW_CHANNEL')
    }
	}
}

// create and start server 
const server = new ApolloServer({ 
	typeDefs, 
	resolvers 
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});