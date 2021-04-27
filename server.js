const { ApolloServer, gql, PubSub } = require('apollo-server');
const pubsub = new PubSub(); // used for subscriptions 

// subscription returns a post type 
// schema  
const typeDefs = gql`
	type Post {
		message: String!
		date: String!
	}

	type Query {
		posts: [Post!]!
	}

	type Mutation {
		addPost(message: String!): Post!
	}

	type Subscription {
		newPost: Post!
	}
`
// mock up data 
const data = [
	{ message: 'hello world', date: new Date() }
]

// resolvers 
const resolvers = {
	Query: {
		posts: () => {
			return data
		}
	},
	Mutation: {
		addPost: (_,{ message }) => {
      const post = { message, date: new Date() }
      date.push(post)
      pubsub.publish('NEW_POST', { newPost: post }) //Publish!
      return post
    }
	},
	Subscription: {
		newPost: {
			subscribe: () => pubsub.asyncIterator('NEW_POST')
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