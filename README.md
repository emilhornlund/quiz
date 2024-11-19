# Quiz

## Managing the Application with the `quiz` Script

The `quiz` script streamlines Docker workflows for building, deploying, and managing the `quiz` application.

### Usage

Run the script with the following syntax:

```sh
./quiz <action> [environment]
```

- **`action`**:
    - `build`: Build the Docker images for `quiz-service` and `quiz`.
    - `deps`: Start the required dependencies (`Redis` and `MongoDB`) with Docker Compose.
    - `deploy`: Deploy the application.
        - Use `local` to build and run locally with Docker Compose.
        - Use `production` to build and push images to the private registry (`192.168.0.65:9500`).

### Examples

- **Build application images**:
  ```sh
  ./quiz build
  ```

- **Start dependencies**:
  ```sh
  ./quiz deps
  ```

- **Deploy locally**:
  ```sh
  ./quiz deploy local
  ```

- **Deploy to production**:
  ```sh
  ./quiz deploy production
  ```
