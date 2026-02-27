import readline from "readline";
import { randomUUID } from "crypto";

enum PizzaSize {
  Small = "Small",
  Medium = "Medium",
  Large = "Large",
}

interface IPricedItem {
  id: string;
  name: string;
  getPrice(): number;
}

class Ingredient implements IPricedItem {
  readonly id: string;
  
  constructor(public name: string, private _price: number) {
    this.id = randomUUID();
  }

  getPrice(): number {
    return this._price;
  }

  setPrice(value: number) {
    if (value >= 0) this._price = value;
  }
}

class Crust implements IPricedItem {
  readonly id: string;
  
  constructor(public name: string, private _price: number) {
    this.id = randomUUID();
  }

  getPrice(): number {
    return this._price;
  }
}

class PizzaRecipe {
  readonly id: string;
  constructor(public name: string, public basePrice: number) {
    this.id = randomUUID();
  }
}

abstract class PizzaBase implements IPricedItem {
  readonly id: string;

  constructor(
    public name: string,
    public size: PizzaSize,
    public crust: Crust
  ) {
    this.id = randomUUID();
  }

  abstract getPrice(): number;

  protected getSizeMultiplier(): number {
    switch (this.size) {
      case PizzaSize.Small: return 1.0;
      case PizzaSize.Medium: return 1.2;
      case PizzaSize.Large: return 1.4;
      default: return 1.0;
    }
  }
}

class StandardPizza extends PizzaBase {
  constructor(
    recipe: PizzaRecipe,
    size: PizzaSize,
    crust: Crust
  ) {
    super(recipe.name, size, crust);
    this.basePrice = recipe.basePrice;
  }

  private basePrice: number;

  getPrice(): number {
    return (this.basePrice * this.getSizeMultiplier()) + this.crust.getPrice();
  }
}

class CustomPizza extends PizzaBase {
  constructor(
    size: PizzaSize,
    crust: Crust,
    private ingredients: Ingredient[]
  ) {
    super("Custom Pizza", size, crust);
  }

  getPrice(): number {
    const ingredientsSum = this.ingredients.reduce((sum, i) => sum + i.getPrice(), 0);
    return (ingredientsSum * this.getSizeMultiplier()) + this.crust.getPrice();
  }
  
  getIngredientsList(): string {
      return this.ingredients.map(i => i.name).join(', ');
  }
}

class Order implements IPricedItem {
  id: string;
  createdAt: Date;
  items: PizzaBase[] = [];
  isCompleted: boolean = false;

  constructor(public customerName: string) {
    this.id = randomUUID();
    this.createdAt = new Date();
  }
  
  get name(): string { return `Order #${this.id.substring(0,4)}`; }

  addItem(item: PizzaBase) {
    this.items.push(item);
  }

  getPrice(): number {
    return this.items.reduce((sum, item) => sum + item.getPrice(), 0);
  }
}

class AppState {
  ingredients: Ingredient[] = [];
  crusts: Crust[] = [];
  recipes: PizzaRecipe[] = [];
  orders: Order[] = [];
}
const state = new AppState();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> => new Promise((res) => rl.question(q, res));

async function main() {
  while (true) {
    console.log("\n=== PIZZA OOP CONSTRUCTOR ===");
    console.log("1. Управление Ингредиентами");
    console.log("2. Управление Бортиками");
    console.log("3. Управление Меню (Рецепты)");
    console.log("4. СОЗДАТЬ ЗАКАЗ");
    console.log("5. Список Заказов");
    console.log("0. Выход");

    const choice = await ask("Выбор: ");
    switch (choice.trim()) {
      case "1": await ingredientsMenu(); break;
      case "2": await crustsMenu(); break;
      case "3": await recipesMenu(); break;
      case "4": await createOrderFlow(); break;
      case "5": await ordersListMenu(); break;
      case "0": rl.close(); return;
      default: console.log("Неверный ввод");
    }
  }
}

async function ingredientsMenu() {
  while (true) {
    console.log("\n--- Ингредиенты ---");
    console.log("1. Добавить");
    console.log("2. Список");
    console.log("3. Удалить");
    console.log("0. Назад");
    const ans = await ask(">> ");
    
    if (ans === "0") return;

    if (ans === "1") {
      const name = await ask("Название: ");
      const price = Number(await ask("Цена: "));
      if (!isNaN(price)) {
        state.ingredients.push(new Ingredient(name, price));
        console.log("Сохранено.");
      }
    } else if (ans === "2") {
      state.ingredients.forEach((i, idx) => console.log(`${idx+1}. ${i.name} - ${i.getPrice()}р`));
    } else if (ans === "3") {
      state.ingredients.forEach((i, idx) => console.log(`${idx+1}. ${i.name}`));
      const delIdx = Number(await ask("Номер для удаления: ")) - 1;
      if (state.ingredients[delIdx]) {
        state.ingredients.splice(delIdx, 1);
        console.log("Удалено.");
      }
    }
  }
}

async function crustsMenu() {
  while (true) {
    console.log("\n--- Бортики ---");
    console.log("1. Добавить тип бортика");
    console.log("2. Список");
    console.log("3. Удалить");
    console.log("0. Назад");
    const ans = await ask(">> ");

    if (ans === "0") return;

    if (ans === "1") {
      const name = await ask("Название: ");
      const price = Number(await ask("Цена добавки: "));
      if (!isNaN(price)) {
        state.crusts.push(new Crust(name, price));
        console.log("Сохранено.");
      }
    } else if (ans === "2") {
      state.crusts.forEach((c, idx) => console.log(`${idx+1}. ${c.name} - ${c.getPrice()}р`));
    } else if (ans === "3") {
      state.crusts.forEach((c, idx) => console.log(`${idx+1}. ${c.name}`));
      const delIdx = Number(await ask("Номер для удаления: ")) - 1;
      if (state.crusts[delIdx]) {
        state.crusts.splice(delIdx, 1);
        console.log("Удалено.");
      }
    }
  }
}

async function recipesMenu() {
  while (true) {
    console.log("\n--- Меню Пиццерии ---");
    console.log("1. Создать рецепт пиццы");
    console.log("2. Список рецептов");
    console.log("3. Удалить рецепт");
    console.log("0. Назад");
    const ans = await ask(">> ");

    if (ans === "0") return;

    if (ans === "1") {
      const name = await ask("Название пиццы: ");
      const price = Number(await ask("Базовая цена: "));
      if (!isNaN(price)) {
        state.recipes.push(new PizzaRecipe(name, price));
        console.log("Рецепт создан.");
      }
    } else if (ans === "2") {
      state.recipes.forEach((r, idx) => console.log(`${idx+1}. ${r.name} (База: ${r.basePrice}р)`));
    } else if (ans === "3") {
      state.recipes.forEach((r, idx) => console.log(`${idx+1}. ${r.name}`));
      const delIdx = Number(await ask("Номер для удаления: ")) - 1;
      if (state.recipes[delIdx]) {
        state.recipes.splice(delIdx, 1);
        console.log("Удалено.");
      }
    }
  }
}

async function createOrderFlow() {
  if (state.crusts.length === 0) { console.log("Сначала создайте хоть один бортик!"); return; }
  
  const client = await ask("Имя клиента: ");
  const order = new Order(client);

  while (true) {
    console.log(`\nЗаказ: ${order.customerName} | Сумма: ${order.getPrice()}р`);
    console.log("1. Добавить ПИЦЦУ ИЗ МЕНЮ");
    console.log("2. Добавить СБОРНУЮ ПИЦЦУ");
    console.log("0. Завершить формирование");
    const choice = await ask(">> ");

    if (choice === "0") break;

    console.log("Размер: 1.S 2.M 3.L");
    const sInput = await ask(">> ");
    const size = sInput==="3"? PizzaSize.Large : sInput==="2"? PizzaSize.Medium : PizzaSize.Small;

    console.log("Выберите бортик:");
    state.crusts.forEach((c, i) => console.log(`${i+1}. ${c.name} (+${c.getPrice()}р)`));
    const cIdx = Number(await ask("Номер >> ")) - 1;
    if (!state.crusts[cIdx]) { console.log("Ошибка выбора бортика"); continue; }
    const selectedCrust = state.crusts[cIdx];

    if (choice === "1") {
      if (state.recipes.length === 0) { console.log("Меню пусто!"); continue; }
      state.recipes.forEach((r, i) => console.log(`${i+1}. ${r.name} - ${r.basePrice}р`));
      
      const rIdx = Number(await ask("Номер пиццы >> ")) - 1;
      if (state.recipes[rIdx]) {
        const p = new StandardPizza(state.recipes[rIdx], size, selectedCrust);
        order.addItem(p);
        console.log("Пицца добавлена!");
      }

    } else if (choice === "2") {
      if (state.ingredients.length === 0) { console.log("Нет ингредиентов!"); continue; }
      
      const selectedIngs: Ingredient[] = [];
      while(true) {
        console.log("Добавьте ингредиент (0 - стоп):");
        state.ingredients.forEach((ing, i) => console.log(`${i+1}. ${ing.name} (${ing.getPrice()}р)`));
        const iIdx = Number(await ask(">> ")) - 1;
        
        if (iIdx === -1) break;
        if (state.ingredients[iIdx]) {
          selectedIngs.push(state.ingredients[iIdx]);
          console.log(`+ ${state.ingredients[iIdx].name}`);
        }
      }
      
      const p = new CustomPizza(size, selectedCrust, selectedIngs);
      order.addItem(p);
      console.log("Кастомная пицца добавлена!");
    }
  }

  state.orders.push(order);
  console.log("Заказ оформлен!");
}

async function ordersListMenu() {
  console.log("\n1. Показать все");
  console.log("2. Найти заказы по имени клиента");
  const ans = await ask(">> ");

  let listToShow = [...state.orders];

  if (ans === "1") {
    listToShow.sort((a, b) => b.getPrice() - a.getPrice());
  } else if (ans === "2") {
    const search = await ask("Введите имя: ");
    listToShow = listToShow.filter(o => o.customerName.toLowerCase().includes(search.toLowerCase()));
  }

  listToShow.forEach(o => {
    console.log(`\n[ID:${o.id.substring(0,4)}] ${o.customerName} - Итого: ${o.getPrice().toFixed(2)}р`);
    console.log(`Дата: ${o.createdAt.toLocaleString()}`);
    o.items.forEach(p => {
      let desc = p.name;
      if (p instanceof CustomPizza) {
        desc += ` (Ингр: ${p.getIngredientsList()})`;
      }
      console.log(`  - ${desc} [${p.size}, ${p.crust.name}] = ${p.getPrice().toFixed(2)}р`);
    });
  });
}

main().catch(console.error);
