// This is an example app used for testing.
// It output text on both the stdout and stderr streams.

console.log('running')
process.stdin.on('data', function() {
  console.log('ended')
  process.exit(1)
})
