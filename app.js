const express = require('express')
// will use this later to send requests
const http = require('http')
// import env variables
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	res.status(200).send(`Server is working. + ${process.env.API_KEY}`)
});


app.post('/getnews', (req, res) => {
	const a = req.body.queryResult.parameters;
	const b = req.body.queryResult.queryText;
	if (a.movie != undefined) {
		res.json({
			fulfillmentText: `This is what you entered  + ${a.movie}`,
			source: 'getmovie'
		})
	} else if(a.email != undefined){
		res.json({
			fulfillmentText: `This is your email address  + ${b}`,
			source: 'getEmail'
		})
	}else{
	res.json({
		fulfillmentText: `Can you please write that again`,
		source: 'getmovie'
	})
}
})

app.post('/getmovie', (req, res) => {
	const movieToSearch =
		req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.movie
			? req.body.result.parameters.movie
			: ''

	const reqUrl = encodeURI(
		//`http://www.omdbapi.com/?t=${movieToSearch}&apikey=${process.env.API_KEY}
		`https://api.themoviedb.org/3/movie/${movieToSearch}?api_key=${process.env.API_KEY}&language=en-US`
	)
	http.get(
		reqUrl,
		responseFromAPI => {
			let completeResponse = ''
			responseFromAPI.on('data', chunk => {
				completeResponse += chunk
			})
			responseFromAPI.on('end', () => {
				const movie = JSON.parse(completeResponse)

				let dataToSend = movieToSearch
				dataToSend = `${movie.Title} was released in the year ${movie.Year}. It is directed by ${
					movie.Director
				} and stars ${movie.Actors}.\n Here some glimpse of the plot: ${movie.Plot}.
                }`

				return res.json({
					fulfillmentText: dataToSend,
					source: 'getmovie'
				})
			})
		},
		error => {
			return res.json({
				fulfillmentText: 'Could not get results at this time',
				source: 'getmovie'
			})
		}
	)
})

app.listen(port, () => {
	console.log(`🌏 Server is running at http://localhost:${port}`)
})