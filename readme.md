# swapi (swagger api)

## Motivation

If you sometime wrote swagger file by yourself, then you should know how painful it is, and how easy forgot to add new endpoints. Here is the tool which creates swagger files based on classes' metadata.

## Explanation

### Decorators

Whole functionality is based on TypeScript Decorators. Here is an explanation of decorators in this repo:

- `@BaseUrl(url: string, relatedTo: { new(): A })` - declares a path which will be used as a prefix for endpoints. url may be wrote wrapped in slashes, or not, it does not matter. Also there is second parameter (as in example `@BaseUrl('Dogs', Owner)`). This means that dogs endpoints will have extra owner prefix, so it will be nested. Notice that url may be in express format. Url `owners/:id`, will be parsed, and parameter `id` will be automatically added in path params, and will have `string` type;
- `@Get(url: string, description?: string)` - declares new `GET` endpoint.
- `@Post(url: string, description?: string)` - declares new `POST` endpoint.
- `@Put(url: string, description?: string)` - declares new `PUT` endpoint.
- `@Patch(url: string, description?: string)` - declares new `PATCH` endpoint.
- `@Delete(url: string, description?: string)` - declares new `DELETE` endpoint.
- `@Param(name: string, type?: string = 'string')` - declares url's parameter. For example if you want change type of `id` param in this url `owners/:id`, then you should write `@Param('id', 'number')`, or `@Param({ id: 'number' })` if you want declare one or more param.
- `@Query(name: string, type?: string = 'string', required: boolean = false)` - declares query's parameter. may have third param, which marks param as required. Also param may be marked as required if last symbol of type will be `*`. So `@Query('token', 'string', true)` will be equal `@Query('token', 'string*')`. It's useful when you declare more than one query param, such as `@Query({ token: 'string*', q: 'string' })`
- `@Body(name: string, type?: string = 'string', required: boolean = false)` - declares body parameter. Has all features as `@Query` decorator.
- `@Response(status: number, type?: string = 'string', isArray?: boolean = false, description?: string = '')` - declares endpoint's response. May be used few times if you want declare few responses. `type` parameter may take simple types, such as `string` or `number`, or custom types. If you want declare custom type, then you should register your type using `addResponseType` function, and then pass the name of custom type in format `'#/' + typeName`, where `typeName` is the name of type.

### Custom types

You may register custom type using `addResponseType` function. `addResponseType(name: string, scheme: any, isArray: boolean = false)`, where `name` is name of a type, `scheme` is an object which keys are names of fields, and a value is a type declaration, `isArray` - marks object as `Array`.

Here is an example of usage:

```TS
@BaseUrl(ownerBaseUrl)
class Owner {
  @Get('/')
  @Response(200, '#/Owner', true) // or @Response(200, '#/Owner[]')
  public getOwners() {
    // ...
  }

  @Get('/:id')
  @Param('id', 'number')
  @Response(200, '#/Owner')
  public getOwnerById() {
    // ...
  }
}

@BaseUrl(dogBaseUrl, Owner)
class Dog {
  @Get('/')
  @Query('token', 'string')
  @Response(200, '#/Dog', true)
  public getDogs() {
    // ...
  }

  @Get('/:id/')
  @Param('id', 'number')
  @Query('token', 'string')
  @Response(200, '#/Dog')
  public getDogById() {
    // ...
  }

  @Post('/:id/')
  @Query('token', 'string')
  @Param('id', 'number')
  @Body({ name: 'string', owner: 'string' })
  @Response(201, '#/Dog')
  public createDog() {
    // ...
  }

  @Put(':id')
  @Query('token', 'string')
  @Param('id', 'number')
  @Body({ name: 'string', owner: 'string' })
  @Response(204)
  @Response(403, 'string', false, 'FORBIDDEN')
  public updateDog() {
    // ...
  }

  @Patch('/:id/owner')
  @Query('token', 'string')
  @Param('id', 'number')
  @Body('owner', 'string')
  @Response(204)
  @Response(403, 'string', false, 'FORBIDDEN')
  public updateDogOwner() {
    // ...
  }

  @Delete('/:id/')
  @Query('token', 'string')
  @Param('id', 'number')
  @Response(204)
  @Response(403, 'string', false, 'FORBIDDEN')
  public deleteDog() {
    // ...
  }
}

const dogScheme = {
  name: 'string',
  owner: 'string',
  id: 'number'
}

// NOTICE: adds new response type in imperative style
addResponseType('Dog', dogScheme);


const ownerScheme = {
  name: 'string',
  id: 'number',
  dog: '#/Dog'
}
addResponseType('Owner', ownerScheme);

// contains valid swagger in yaml format
const swaggerYamlDeclaration = generateSwaggerYaml();
```

Result:

```YAML
---
  swagger: "2.0"
  info:
    version: "0.0.1"
    title: "swapi"
    description: ""
    license:
      name: "ISC"
    contact:
      name: "A.Kanaki"
  host: "host"
  basePath: "/"
  schemes:
    - "https"
  produces:
    - "application/json"
  consumes:
    - "application/json"
  paths:
    /owner/:
      get:
        description: ""
        operationId: "getOwners"
        produces:
          - "application/json"
        responses:
          200:
            description: "OK"
            schema:
              type: "array"
              items:
                $ref: "#/definitions/Owner"
    /owner/${id}/:
      get:
        description: ""
        operationId: "getOwnerById"
        produces:
          - "application/json"
        responses:
          200:
            description: "OK"
            schema:
              $ref: "#/definitions/Owner"
        parameters:
          -
            name: "id"
            in: "path"
            required: true
            type: "number"
    /owner/dog/:
      get:
        description: ""
        operationId: "getDogs"
        produces:
          - "application/json"
        responses:
          200:
            description: "OK"
            schema:
              type: "array"
              items:
                $ref: "#/definitions/Dog"
        parameters:
          -
            name: "token"
            in: "query"
            required: false
            type: "string"
    /owner/dog/${id}/:
      get:
        description: ""
        operationId: "getDogById"
        produces:
          - "application/json"
        responses:
          200:
            description: "OK"
            schema:
              $ref: "#/definitions/Dog"
        parameters:
          -
            name: "token"
            in: "query"
            required: false
            type: "string"
          -
            name: "id"
            in: "path"
            required: true
            type: "number"
      post:
        description: ""
        operationId: "createDog"
        produces:
          - "application/json"
        responses:
          201:
            description: "OK"
            schema:
              $ref: "#/definitions/Dog"
        parameters:
          -
            name: "token"
            in: "query"
            required: false
            type: "string"
          -
            name: "id"
            in: "path"
            required: true
            type: "number"
          -
            name: "createDogBody"
            in: "body"
            schema:
              type: "object"
              properties:
                name:
                  type: "string"
                owner:
                  type: "string"
      put:
        description: ""
        operationId: "updateDog"
        produces:
          - "application/json"
        responses:
          204:
            description: "OK"
            schema:
              type: "string"
          403:
            description: "FORBIDDEN"
            schema:
              type: "string"
        parameters:
          -
            name: "token"
            in: "query"
            required: false
            type: "string"
          -
            name: "id"
            in: "path"
            required: true
            type: "number"
          -
            name: "updateDogBody"
            in: "body"
            schema:
              type: "object"
              properties:
                name:
                  type: "string"
                owner:
                  type: "string"
      delete:
        description: ""
        operationId: "deleteDog"
        produces:
          - "application/json"
        responses:
          204:
            description: "OK"
            schema:
              type: "string"
          403:
            description: "FORBIDDEN"
            schema:
              type: "string"
        parameters:
          -
            name: "token"
            in: "query"
            required: false
            type: "string"
          -
            name: "id"
            in: "path"
            required: true
            type: "number"
    /owner/dog/${id}/owner/:
      patch:
        description: ""
        operationId: "updateDogOwner"
        produces:
          - "application/json"
        responses:
          204:
            description: "OK"
            schema:
              type: "string"
          403:
            description: "FORBIDDEN"
            schema:
              type: "string"
        parameters:
          -
            name: "token"
            in: "query"
            required: false
            type: "string"
          -
            name: "id"
            in: "path"
            required: true
            type: "number"
          -
            name: "updateDogOwnerBody"
            in: "body"
            schema:
              type: "object"
              properties:
                owner:
                  type: "string"
  definitions:
    Dog:
      type: "object"
      properties:
        name:
          type: "string"
        owner:
          type: "string"
        id:
          type: "number"
    Owner:
      type: "object"
      properties:
        name:
          type: "string"
        id:
          type: "number"
        dog:
          $ref: "#/definitions/Dog"
```
