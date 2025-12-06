class ApiResponse {
    constructor(res) {
        this.res = res;
    }

    success(data, statusCode = 200) {
        this.res.status(statusCode).json({
            success: true,
            data: data
        });
    }

    created(data) {
        this.success(data, 201);
    }

    noContent() {
        this.res.status(204).send();
    }

    error(message, statusCode = 400) {
        this.res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    notFound(message = 'Resource not found') {
        this.error(message, 404);
    }
}

module.exports = ApiResponse;