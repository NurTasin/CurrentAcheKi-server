# API Documentation

This is the API documentation for CurrentAcheKi v1.

## Endpoint: `/api/v1/device/create`

**Description:** Creates a new device and registers it in the database.

**Method:** POST

### Payload

| Field       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| `deviceId`      | string | The ID of the device to remove.           |
| `password`   | string | The password of the device to remove.    |

### Response

| Status Code | Response                          | Description                                          |
|-------------|----------------------------------|------------------------------------------------------|
| 200         | Device created successfully!     | The device was successfully created and registered.  |
| 400         | This device is already registered | The device with the given ID is already registered.  |

---

## Endpoint: `/api/v1/device/get/:deviceId`

**Description:** Retrieves device information by device ID.

**Method:** GET

### Parameters

| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| `deviceId`   | string | The ID of the device to retrieve. |

### Response

| Status Code | Response                          | Description                                          |
|-------------|----------------------------------|------------------------------------------------------|
| 200         | Device found!                    | The device information was found and returned.       |
| 404         | No Device Found                  | No device was found with the given ID.               |

---

## Endpoint: `/api/v1/device/interupt/get/:deviceId`

**Description:** Retrieves interrupt data for a device by device ID.

**Method:** GET

### Parameters

| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| `deviceId`   | string | The ID of the device to retrieve interrupt data for. |

### Response

| Status Code | Response                          | Description                                          |
|-------------|----------------------------------|------------------------------------------------------|
| 200         | Device found!                    | The interrupt data for the device was found and returned. |
| 404         | No Device Found                  | No device was found with the given ID.               |

---

## Endpoint:

 `/api/v1/device/remove`

**Description:** Removes a device and its associated interrupt data from the database.

**Method:** POST

### Payload

| Field       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| `deviceId`      | string | The ID of the device to remove.           |
| `password`   | string | The password of the device to remove.    |

### Response

| Status Code | Response                          | Description                                          |
|-------------|----------------------------------|------------------------------------------------------|
| 200         | Device was removed.              | The device and its associated interrupt data were removed. |
| 404         | No device found with that id and password | No device was found with the given ID and password.               |
| 400         | No device ID or Password was sent. | The request was missing the device ID or password. |

---

## Endpoint: `/api/v1/device/interupt/clear`

**Description:** Clears interrupt data for a device.

**Method:** POST

### Payload

| Field       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| `deviceId`      | string | The ID of the device to clear interrupt data for.           |

### Response

| Status Code | Response                          | Description                                          |
|-------------|----------------------------------|------------------------------------------------------|
| 200         | Interrupt data was cleared.      | The interrupt data for the device was cleared. |
| 400         | Device was not found with that ID. | No device was found with the given ID. |
| 400         | No device ID was provided. | The request was missing the device ID. |

---
## Endpoint: `/api/v1/device/ping`

**Description:** Receives a ping from a device and updates the last pinged timestamp for the device.

**Method:** POST

### Payload

| Field       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| `deviceId`      | string | The ID of the device sending the ping.     |
| `lastTimeEpoch` | number | The timestamp of the ping in epoch format. |

### Response

| Status Code | Response                          | Description                                          |
|-------------|----------------------------------|------------------------------------------------------|
| 200         | OK                               | The ping was successfully received and processed.     |
| 400         | Bad Request                       | The request was missing the device ID or timestamp.  |
| 400         | Device is not registered.         | The device is not registered in the database.        |

---

## Endpoint: `/api/v1/device/reportInterupt`

**Description:** Processes an interrupt report from a device and saves the interrupt data.

**Method:** POST

### Payload

| Field       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| `deviceId`      | string | The ID of the device reporting the interrupt.   |
| `lastTimeEpoch` | number | The timestamp of the interrupt in epoch format. |

### Response

| Status Code | Response                          | Description                                          |
|-------------|----------------------------------|------------------------------------------------------|
| 200         | OK                               | The interrupt report was successfully processed.     |
| 400         | Bad Request                       | The request was missing the device ID or timestamp.  |
| 400         | Device is not registered.         | The device is not registered in the database.        |

---
Please note that the API runs on the specified `PORT` or defaults to `3000`. Make sure to update the environment variable `CONNECTION_STRING` with the appropriate database connection string before running the server.