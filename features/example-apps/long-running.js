// This is an example app used for testing.
// It output text on both the stdout and stderr streams.

const http = require("http")

port = process.argv[2]
if (!port) throw new Error("no port provided")
handler = function(_, res) {
  res.end("long-running server")
}
http.createServer(handler).listen(port, "localhost")
console.log(`online at port ${port}`)
