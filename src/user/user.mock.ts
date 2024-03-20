export function mockVolatileValues() {
    return {
        id: 1,
        modified: new Date(),
    }
}


export function mockCreateUser() {
    return {
        name: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '123456789',
        created: new Date(),
    }
}

export function mockUsers() {
    return [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', cpf: '123456789', created: new Date(), modified: new Date() },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', cpf: '1234567891', created: new Date(), modified: new Date() },
    ]
}