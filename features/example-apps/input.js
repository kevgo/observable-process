const readln = require("readline")
const cl = readln.createInterface(process.stdin, process.stdout)

const question = function() {
  return new Promise(resolve => {
    cl.question("", answer => {
      resolve(answer)
    })
  })
}

async function main() {
  const answer = await question()
  console.log(`You entered ${answer}`)
  cl.close()
}

main()
