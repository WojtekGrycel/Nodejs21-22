function print(time) {
    console.log(`Hello after ${time} seconds`)
}

setTimeout(print, 4000, 4);
setTimeout(print, 8000, 8);
