class ApiResponse {
  constructor(data, message = "", success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date();
  }
}

module.exports = ApiResponse;
