//CRUD Refactoring, OOP: (yeah my steps, i see you stalker)
//1-creating a Product class to represent the product entity, defining properties and methods related to a product
//2-creating a Storage Class: local storage
//3-creating a UI Class
//4-creating a Controller Class: to coordinate between the UI and Storage, and add event listeners
//5-integrate SweetAlert

class Product {
  constructor(name, cat, price, dec) {
    this.name = name;
    this.cat = cat;
    this.price = price;
    this.dec = dec;
  }
}

class ProductStorage {
  static getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
  }

  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static addProduct(product) {
    const products = this.getProducts();
    products.push(product);
    this.saveProducts(products);
  }

  static updateProduct(index, updatedProduct) {
    const products = this.getProducts();
    products[index] = updatedProduct;
    this.saveProducts(products);
  }

  static deleteProduct(index) {
    const products = this.getProducts();
    products.splice(index, 1);
    this.saveProducts(products);
  }
}


class ProductUI {
  constructor() {
    this.productsContainer = document.getElementById("product-table-container");
    this.warningMessage = document.getElementById("warning-msg");
    this.tableBody = document.getElementById("table-body");
    this.productForm = document.getElementById("product-form");
    this.createBtn = document.getElementById("create-btn");
    this.clearBtn = document.getElementById("clear-btn");
    this.productName = document.getElementById("product_name");
    this.productCat = document.getElementById("product_category");
    this.productPrice = document.getElementById("product_price");
    this.productDesc = document.getElementById("prodct_desc");
    this.searchInput = document.getElementById("query");
    this.isUpdate = false;
    this.updatedProductIndex = -1;
  }

  renderProducts(products) {
    this.tableBody.innerHTML = '';
    if (products.length === 0) {
      this.warningMessage.classList.remove("d-none");
      this.warningMessage.classList.add("d-block");
      this.productsContainer.classList.add("d-none");
      this.productsContainer.classList.remove("d-block");
      return;
    }

    this.warningMessage.classList.add("d-none");
    this.warningMessage.classList.remove("d-block");
    this.productsContainer.classList.remove("d-none");
    this.productsContainer.classList.add("d-block");

    products.forEach((product, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <th>${index + 1}</th>
        <td>${product.name}</td>
        <td>${product.cat}</td>
        <td>${product.price}</td>
        <td>${product.dec}</td>
        <td>
          <button class="btn btn-outline-success" onclick="productController.editProduct(${index})">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        </td>
        <td>
          <button class="btn btn-outline-danger" onclick="productController.confirmDeleteProduct(${index})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      this.tableBody.appendChild(row);
    });
  }

  clearForm() {
    this.productForm.reset();
    this.createBtn.textContent = 'Add Product';
    this.isUpdate = false;
    this.updatedProductIndex = -1;
  }

  fillForm(product) {
    this.productName.value = product.name;
    this.productCat.value = product.cat;
    this.productPrice.value = product.price;
    this.productDesc.value = product.dec;
    this.createBtn.textContent = 'Update Product';
    this.isUpdate = true;
  }

  showError(input, message) {
    const feedbackDiv = input.nextElementSibling;
    if (feedbackDiv) {
      feedbackDiv.textContent = message;
      input.classList.add('is-invalid');
    }
  }

  clearError(input) {
    const feedbackDiv = input.nextElementSibling;
    if (feedbackDiv) {
      feedbackDiv.textContent = '';
      input.classList.remove('is-invalid');
    }
  }

  validateForm() {
    let isValid = true;
    const namePattern = /^[a-zA-Z\s]+$/;
    const catPattern = /^[a-zA-Z\s]+$/;
    const pricePattern = /^\d+(\.\d{1,2})?$/;
    const descPattern = /.+/;

    if (!namePattern.test(this.productName.value.trim())) {
      this.showError(this.productName, "Product name must contain only letters and spaces");
      isValid = false;
    } else {
      this.clearError(this.productName);
    }

    if (!catPattern.test(this.productCat.value.trim())) {
      this.showError(this.productCat, "Product category must contain only letters and spaces");
      isValid = false;
    } else {
      this.clearError(this.productCat);
    }

    if (!pricePattern.test(this.productPrice.value.trim())) {
      this.showError(this.productPrice, "Product price must be a valid number (e.g., 10.99)");
      isValid = false;
    } else {
      this.clearError(this.productPrice);
    }

    if (!descPattern.test(this.productDesc.value.trim())) {
      this.showError(this.productDesc, "Product description cannot be empty");
      isValid = false;
    } else {
      this.clearError(this.productDesc);
    }

    return isValid;
  }
}

class ProductController {
  constructor(ui, storage) {
    this.ui = ui;
    this.storage = storage;
    this.init();
  }

  init() {
    this.ui.renderProducts(this.storage.getProducts());
    this.ui.productForm.onsubmit = (event) => this.handleSubmit(event);
    this.ui.clearBtn.onclick = () => this.ui.clearForm();
    this.ui.searchInput.onkeyup = (event) => this.handleSearch(event);
  }

  handleSubmit(event) {
    event.preventDefault();
    if (!this.ui.validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'All fields are required. Please fill out the form completely.',
      });
      return;
    }

    const product = new Product(
      this.ui.productName.value,
      this.ui.productCat.value,
      this.ui.productPrice.value,
      this.ui.productDesc.value
    );

    if (this.ui.isUpdate) {
      this.storage.updateProduct(this.ui.updatedProductIndex, product);
      this.ui.createBtn.textContent = 'Add Product';
      this.ui.isUpdate = false;
    } else {
      this.storage.addProduct(product);
    }

    this.ui.renderProducts(this.storage.getProducts());
    this.ui.clearForm();
  }

  editProduct(index) {
    const product = this.storage.getProducts()[index];
    this.ui.fillForm(product);
    this.ui.isUpdate = true;
    this.ui.updatedProductIndex = index;
  }

  confirmDeleteProduct(index) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteProduct(index);
        Swal.fire(
          'Deleted!',
          'Your product has been deleted.',
          'success'
        );
      }
    });
  }

  deleteProduct(index) {
    this.storage.deleteProduct(index);
    this.ui.renderProducts(this.storage.getProducts());
  }

  handleSearch(event) {
    const value = this.ui.searchInput.value;
    const products = this.storage.getProducts();
    let filteredProducts = products.filter(product => product.name.includes(value));

    if (filteredProducts.length === 0 && event.key === "Enter") {
      Swal.fire({
        icon: 'info',
        title: 'No Results Found',
        text: 'No products found matching this name',
        footer: '<button onclick="productController.returnToHome();" class="btn btn-primary">Return to Home</button>',
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false, //preventing closing by clicking outside
      });
    } else {
      this.ui.renderProducts(filteredProducts);
    }
  }

  returnToHome() {
    this.ui.searchInput.value = '';
    Swal.close();
    this.ui.renderProducts(this.storage.getProducts());
  }
}

//initializing the app
const productUI = new ProductUI();
const productController = new ProductController(productUI, ProductStorage);
