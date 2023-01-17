import ReactiveSystem from './src/ReactiveSystem.js';

// === Simple references and computed ===
console.log('=== Simple references and computed ===');
const rs = new ReactiveSystem();

const price = rs.ref(10);
let count = rs.ref(2);

const totalPrice = rs.computed(() => price.value * count.value);
const finalPrice = rs.computed(() => totalPrice.value * 0.5); // 50% discount

console.log(totalPrice.value, finalPrice.value); // 20, 10;

count.value++;

console.log(finalPrice.value, totalPrice.value); // 15, 30 (finalPrice logs first)

count.value++;

console.log(totalPrice.value, finalPrice.value); // 40, 20 (finalPrice logs last)



// === Deep computed objects ===
console.log('=== Deep computed objects ===');
let someRef = rs.ref(2);

const comp = rs.computed(() => {
  return {
    deep: {
      a: someRef.value, // 2
    },
  }
});

const comp2 = rs.computed(() => {
  return comp.value.deep.a * 2; // 4
});

console.log(comp.value, comp2.value); // 2, 4

someRef.value++;

console.log(comp.value, comp2.value); // 3, 6




// === Reactive objects ===
console.log('=== Reactive objects ===');
const goods = rs.reactive([
    { amount: 3, price: 10 }, // 30
    { amount: 2, price: 15 }, // 30
]);

const totalGoodsPrice = rs.computed(() => {
    return goods.reduce((total, good) => {
        return total + good.amount * good.price;
    }, 0);
});

console.log(goods, totalGoodsPrice.value); // 60

goods.push({ amount: 4, price: 5 });

console.log(goods, totalGoodsPrice.value); // 80

goods[2].amount -= 1;

console.log(goods, totalGoodsPrice.value, 'not working'); // 75 - not working, reactive() hasn't deep reactivity

// removing element
goods.pop();

console.log(goods, totalGoodsPrice.value); // 60


// === Watchers ===
console.log('=== Watchers ===');

const observable = rs.ref(200);
const computedObservable = rs.computed(() => observable.value + 1000);

rs.watch(() => {
    console.log('Change observable', observable.value); // 200, 202 (first time on initialization, second after all sync changes)
});

rs.watch(() => {
    console.log('Change observable and computed observable', computedObservable.value); // 1200, 1202
});

// two changes, but every watcher runs once after all changes because it is microtask
observable.value++;
observable.value++;
