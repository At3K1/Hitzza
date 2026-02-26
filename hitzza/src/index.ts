import readline from "readline";
import { randomUUID } from "crypto";

type Money = number;

class Ingredient {
  id: string;
  name: string;
  price: Money;

  constructor(name: string, price: Money) {
    this.id = randomUUID();
    this.name = name;
    this.price = price;
  }
}

class DoughType {
  id: string;
  name: string;
  price: Money;
  isClassic: boolean;

  constructor(name: string, price: Money, isClassic: boolean = false) {
    this.id = randomUUID();
    this.name = name;
    this.price = price;
    this.isClassic = isClassic;
  }
}

class Pizza {
  id: string;
  name: string;
  base: DoughType;
  ingredients: Ingredient[];

  constructor(name: string, base: DoughType, ingredients: Ingredient[]) {
    this.id = randomUUID();
    this.name = name;
    this.base = base;
    this.ingredients = ingredients;
  }

  get price(): Money {
    const ingredientsSum = this.ingredients.reduce((sum, i) => sum + i.price, 0);
    return this.base.price + ingredientsSum;
  }
}

class AppState {
  ingredients: Ingredient[] = [];
  doughTypes: DoughType[] = [];
  pizzas: Pizza[] = [];
}

const state = new AppState();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function mainMenu(): Promise<void> {
  while (true) {
    console.log("\n=== Конструктор пиццы ===");
    console.log("1. Ингредиенты");
    console.log("2. Типы основ");
    console.log("3. Пиццы");
    console.log("0. Выход");
    const choice = await ask("Выберите пункт: ");

    switch (choice.trim()) {
      case "1":
        await ingredientsMenu();
        break;
      case "2":
        await doughMenu();
        break;
      case "3":
        await pizzaMenu();
        break;
      case "0":
        rl.close();
        return;
      default:
        console.log("Неизвестная команда.");
    }
  }
}

async function ingredientsMenu(): Promise<void> {
  while (true) {
    console.log("\n--- Ингредиенты ---");
    console.log("1. Список ингредиентов");
    console.log("2. Добавить ингредиент");
    console.log("3. Удалить ингредиент");
    console.log("0. Назад");
    const choice = await ask("Выберите пункт: ");

    if (choice.trim() === "0") {
      return;
    }

    switch (choice.trim()) {
      case "1":
        listIngredients();
        break;
      case "2":
        await createIngredient();
        break;
      case "3":
        await deleteIngredient();
        break;
      default:
        console.log("Неизвестная команда.");
    }
  }
}

function listIngredients(): void {
  if (state.ingredients.length === 0) {
    console.log("Ингредиентов пока нет.");
    return;
  }
  console.log("\nСписок ингредиентов:");
  state.ingredients.forEach((ing, index) => {
    console.log(`${index + 1}. ${ing.name} - ${ing.price.toFixed(2)}₽`);
  });
}

async function createIngredient(): Promise<void> {
  const name = await ask("Название ингредиента: ");
  const priceText = await ask("Стоимость ингредиента: ");
  const price = Number(priceText);
  if (!name.trim() || isNaN(price) || price < 0) {
    console.log("Некорректные данные.");
    return;
  }
  state.ingredients.push(new Ingredient(name.trim(), price));
  console.log("Ингредиент добавлен.");
}

async function deleteIngredient(): Promise<void> {
  if (state.ingredients.length === 0) {
    console.log("Ингредиентов нет.");
    return;
  }
  listIngredients();
  const indexText = await ask("Номер ингредиента для удаления: ");
  const index = Number(indexText) - 1;
  if (index < 0 || index >= state.ingredients.length) {
    console.log("Некорректный номер.");
    return;
  }
  state.ingredients.splice(index, 1);
  console.log("Ингредиент удалён.");
}

async function doughMenu(): Promise<void> {
  while (true) {
    console.log("\n--- Типы основ ---");
    console.log("1. Список основ");
    console.log("2. Добавить основу");
    console.log("3. Удалить основу");
    console.log("0. Назад");
    const choice = await ask("Выберите пункт: ");

    if (choice.trim() === "0") {
      return;
    }

    switch (choice.trim()) {
      case "1":
        listDough();
        break;
      case "2":
        await createDough();
        break;
      case "3":
        await deleteDough();
        break;
      default:
        console.log("Неизвестная команда.");
    }
  }
}

function listDough(): void {
  if (state.doughTypes.length === 0) {
    console.log("Основ пока нет.");
    return;
  }
  console.log("\nСписок основ:");
  state.doughTypes.forEach((d, index) => {
    const mark = d.isClassic ? " (классическая)" : "";
    console.log(`${index + 1}. ${d.name}${mark} - ${d.price.toFixed(2)}₽`);
  });
}

async function createDough(): Promise<void> {
  const name = await ask("Название основы: ");
  const priceText = await ask("Стоимость основы: ");
  const price = Number(priceText);
  const isClassicAnswer = await ask("Это классическая основа? (y/n): ");
  const isClassic = isClassicAnswer.trim().toLowerCase() === "y";

  if (!name.trim() || isNaN(price) || price < 0) {
    console.log("Некорректные данные.");
    return;
  }

  const classic = state.doughTypes.find((d) => d.isClassic);
  if (classic && !isClassic) {
    const maxPrice = classic.price * 1.2;
    if (price > maxPrice) {
      console.log(
        `Цена не должна превышать 20% от классической (${maxPrice.toFixed(2)}₽).`
      );
      return;
    }
  }

  if (isClassic) {
    state.doughTypes.forEach((d) => (d.isClassic = false));
  }

  state.doughTypes.push(new DoughType(name.trim(), price, isClassic));
  console.log("Основа добавлена.");
}

async function deleteDough(): Promise<void> {
  if (state.doughTypes.length === 0) {
    console.log("Основ нет.");
    return;
  }
  listDough();
  const indexText = await ask("Номер основы для удаления: ");
  const index = Number(indexText) - 1;
  if (index < 0 || index >= state.doughTypes.length) {
    console.log("Некорректный номер.");
    return;
  }
  state.doughTypes.splice(index, 1);
  console.log("Основа удалена.");
}

async function pizzaMenu(): Promise<void> {
  while (true) {
    console.log("\n--- Пиццы ---");
    console.log("1. Список пицц");
    console.log("2. Добавить пиццу");
    console.log("3. Удалить пиццу");
    console.log("0. Назад");
    const choice = await ask("Выберите пункт: ");

    if (choice.trim() === "0") {
      return;
    }

    switch (choice.trim()) {
      case "1":
        listPizzas();
        break;
      case "2":
        await createPizza();
        break;
      case "3":
        await deletePizza();
        break;
      default:
        console.log("Неизвестная команда.");
    }
  }
}

function listPizzas(): void {
  if (state.pizzas.length === 0) {
    console.log("Пицц пока нет.");
    return;
  }
  console.log("\nСписок пицц:");
  state.pizzas.forEach((p, index) => {
    const ingredientsNames = p.ingredients.map((i) => i.name).join(", ");
    console.log(
      `${index + 1}. ${p.name} [${p.base.name}] (${ingredientsNames}) = ${p.price.toFixed(2)}₽`
    );
  });
}

async function createPizza(): Promise<void> {
  if (state.doughTypes.length === 0) {
    console.log("Сначала создайте хотя бы одну основу.");
    return;
  }
  if (state.ingredients.length === 0) {
    console.log("Сначала создайте хотя бы один ингредиент.");
    return;
  }

  const name = await ask("Название пиццы: ");
  if (!name.trim()) {
    console.log("Название не может быть пустым.");
    return;
  }

  listDough();
  const doughIndexText = await ask("Выберите номер основы: ");
  const doughIndex = Number(doughIndexText) - 1;
  const base = state.doughTypes[doughIndex];
  if (!base) {
    console.log("Некорректный номер основы.");
    return;
  }

  const ingredients: Ingredient[] = [];
  while (true) {
    listIngredients();
    const ingIndexText = await ask(
      "Номер ингредиента для добавления (0 - закончить): "
    );
    const ingIndex = Number(ingIndexText) - 1;

    if (ingIndexText.trim() === "0") {
      break;
    }

    const ing = state.ingredients[ingIndex];
    if (!ing) {
      console.log("Некорректный номер.");
      continue;
    }
    ingredients.push(ing);
  }

  if (ingredients.length === 0) {
    console.log("Нужно выбрать хотя бы один ингредиент.");
    return;
  }

  state.pizzas.push(new Pizza(name.trim(), base, ingredients));
  console.log("Пицца добавлена.");
}

async function deletePizza(): Promise<void> {
  if (state.pizzas.length === 0) {
    console.log("Пицц нет.");
    return;
  }
  listPizzas();
  const indexText = await ask("Номер пиццы для удаления: ");
  const index = Number(indexText) - 1;
  if (index < 0 || index >= state.pizzas.length) {
    console.log("Некорректный номер.");
    return;
  }
  state.pizzas.splice(index, 1);
  console.log("Пицца удалена.");
}

mainMenu().catch((error) => {
  console.error(error);
  rl.close();
});

