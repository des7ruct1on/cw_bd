import { DeleteRowData } from '../types/DeleteRowData';
import { InsertRowData } from '../types/InsertRowData';
import { UpdateValueData } from '../types/UpdateValueData';
import { API_URL } from './constants';

class Api {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async _checkStatus(response: Response) {
    if (response.ok) {
      return response.json();
    }
    return response.json().then(err => Promise.reject(err));
  }

  // Register a new user
  async register(username: string, password: string, email: string) {
    return fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email }),
    })
      .then(res => this._checkStatus(res));
  }

  // User login
  async login(username: string, password: string) {
    return fetch(`${this.baseURL}/login`, {
      method: 'POST',
      body: new URLSearchParams({
        username,
        password,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(res => this._checkStatus(res));
  }

  // Get current user details
  async getCurrentUser(token: string) {
    return fetch(`${this.baseURL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => this._checkStatus(res));
  }

  async getCurrentUserRole(token: string) {
    return fetch(`${this.baseURL}/profile/role`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => this._checkStatus(res));
  }

  // Fetch all products
  async getAllProducts() {
    return fetch(`${this.baseURL}/products`, {
      method: 'GET',
    })
      .then(res => this._checkStatus(res));
  }

  // Search products by name
  async searchProducts(name: string) {
    const url = name ? `${this.baseURL}/products/search?name=${encodeURIComponent(name)}` : `${this.baseURL}/products/search`;
    return fetch(url, {
      method: 'GET',
    })
      .then(res => this._checkStatus(res));
  }

  // Create a new order
  async createOrder(order: { car_name: string; shipment_method_name: string }, token: string) {
    return fetch(`${this.baseURL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    })
      .then(res => this._checkStatus(res));
  }

  // Get all orders for the current user
  async getOrders(token: string) {
    return fetch(`${this.baseURL}/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => this._checkStatus(res));
  }

  async getFullTable(token: string, table_name: string) {
    return fetch(`${this.baseURL}/database/${table_name}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })
      .then(res => {
        return this._checkStatus(res);
      });
  }

  async updateValue(token: string, data: UpdateValueData) {
    return fetch(`${this.baseURL}/database/update-value`, {
      method: 'PATCH',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    })
      .then(res => {
        return this._checkStatus(res);
      });
  }

  async deleteRow(token: string, data: DeleteRowData) {
    return fetch(`${this.baseURL}/database/delete-row`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    })
      .then(res => {
        return this._checkStatus(res);
      });
  }

  async insertRow(token: string, data: InsertRowData) {
    return fetch(`${this.baseURL}/database/insert-row`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    })
      .then(res => {
        return this._checkStatus(res);
      });
  }

  async createBackup(token: string, backup_name: string) {
    return fetch(`${this.baseURL}/backup/create`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ backup_name }),
    })
      .then(res => {
        return this._checkStatus(res);
      });
  }

  async deleteBackup(token: string, backup_name: string) {
    return fetch(`${this.baseURL}/backup/delete`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ backup_name }),
    })
      .then(res => {
        return this._checkStatus(res);
      });
  }

  async restoreBackup(token: string, backup_name: string) {
    return fetch(`${this.baseURL}/backup/restore`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ backup_name }),
    })
      .then(res => {
        return this._checkStatus(res);
      });
  }

  async getAllBackups(token: string) {
    return fetch(`${this.baseURL}/backup/list`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => {
        return this._checkStatus(res);
      });
  }

  async getOrderSummary(token: string) {
    return fetch(`${this.baseURL}/database/analytics/order-summary`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => {
        return this._checkStatus(res);
      });
  }
};

const api = new Api(API_URL);

export default api;
