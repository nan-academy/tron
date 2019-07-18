const SIZE = 100
const MAP = new Int8Array(SIZE * SIZE) // State of the Map
const isFree = ({ x, y }) => MAP[y * SIZE + x] === 0 // 0 = block free
const isOccupied = ({ x, y }) => MAP[y * SIZE + x] === 1 // 1 = block occupied

// `inBounds` check if our coord (n) is an existing index in our MAP
const inBounds = n => n < SIZE && n >= 0

// `isInBounds` check that properties x and y of our argument are both in bounds
const isInBounds = ({ x, y }) => inBounds(x) && inBounds(y)

// `pickRandom` Get a random element from an array
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)]

// `update` this function is called at each turn
const update = state => {
  // update is called with a state argument that has 2 properties:
  //   players: an array of all the players
  //   player: the player for this AI

  // Each players contains:
  //   color: A number that represent the color of a player
  //   name: A string of the player name
  //   score: A number of the total block collected by this player
  //   x: The horizontal position of the player
  //   y: The vertical position of the player
  //   coords: An array of 4 coordinates of the nearest blocks
  //     [ NORTH, EAST, SOUTH, WEST ]
  //                  N
  //               W  +  E
  //                  S

  // Each coordinate contains:
  //   x: The horizontal position
  //   y: The vertical position
  //   cardinal: A number between 0 and 3 that represent the cardinal
  //     [ 0: NORTH, 1: EAST, 2: SOUTH, 3: WEST ]
  //   direction: A number between 0 and 3 that represent the direction
  //     [ 0: FORWARD, 1: RIGHT, 2: BACKWARD, 3: LEFT ]

  // Actual AI logic:
  // I filter my array of coords to keep only those that are in bounds
  const coordsInBound = state.player.coords.filter(isInBounds)

  // I filter again to keep coords that are free
  const available = coordsInBound.filter(isFree)

  // And I return a random available coord
  return pickRandom(available)
}


// This part of the code should be left untouch since it's initializing
// and configuring communication of the web worker to the main page.
// Only edit that if you know your shit
addEventListener('message', self.init = initEvent => {
  const { seed, id } = JSON.parse(initEvent.data)
  const isOwnPlayer = p => p.name === id
  const addToMap = ({ x, y }) => MAP[y * SIZE + x] = 1

  let _seed = seed // We use a seeded random to replay games
  const _m = 0x80000000
  Math.random = () => (_seed = (1103515245 * _seed + 12345) % _m) / (_m - 1)
  removeEventListener('message', self.init)
  addEventListener('message', ({ data }) => {
    const players = JSON.parse(data)
    const player = players.find(isOwnPlayer)
    players.forEach(addToMap) // I update the MAP with the new position of
    // each players

    postMessage(JSON.stringify(update({ players, player })))
  })
  postMessage('loaded') // Signal that the loading is over
})

