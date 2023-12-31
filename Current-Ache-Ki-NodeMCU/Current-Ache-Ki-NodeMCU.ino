#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <FS.h>
#include <ArduinoJson.h>

// Yey you have got my wifi password!
const char* ssid = "One "; //YOUR WIFI SSID HERE
const char* password = "Raihan#1"; //YOUR WIFI PASSWORD HERE
const char* serverUrl = "https://currentacheki.cyclic.app";
const int port = 443;
String PING_ENDPOINT = "/api/v1/device/ping";
String POST_ENDPOINT = "/api/v1/device/reportInterupt";
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");
unsigned long LatestEpochTime = 0;
bool ConnectionError = false;
bool WifiError = false;
unsigned long backupEpochTime;
bool powerCutPacketSendFailed = false;

void WriteEpochSPIFFS(unsigned long value) {
  File file = SPIFFS.open("/data.txt", "w");
  if (file) {
    file.println(value);
    file.close();
  }
}

unsigned long ReadEpochSPIFFS() {
  File file = SPIFFS.open("/data.txt", "r");
  if (file) {
    String valueString = file.readStringUntil('\n');
    file.close();
    return valueString.toInt();
  }
  return 0; // Return a default value if reading fails
}

String getUniqueID() {
  byte mac[6];
  WiFi.macAddress(mac);

  String macAddress="CA_NODE-";
  for (int i = 0; i < 6; ++i) {
    if (mac[i] < 0x10) {
      macAddress += "0"; // Add leading zero if necessary
    }
    macAddress += String(mac[i], HEX);
  }

  return macAddress;
}

String DeviceID = getUniqueID();
#define TIMING_SPACER_CONSTANT 500
void StartUpLEDSequence(){
  for(int i=0;i<5;i++){
    for (int brightness = 0; brightness <= TIMING_SPACER_CONSTANT; brightness++) {
      digitalWrite(LED_BUILTIN, HIGH); // Turn on the LED
      delayMicroseconds(brightness); // Duration of ON state
      digitalWrite(LED_BUILTIN, LOW); // Turn off the LED
      delayMicroseconds(TIMING_SPACER_CONSTANT - brightness); // Duration of OFF state
    }
    
    // Decrease brightness from 255 to 0
    for (int brightness = TIMING_SPACER_CONSTANT; brightness >= 0; brightness--) {
      digitalWrite(LED_BUILTIN, HIGH); // Turn on the LED
      delayMicroseconds(brightness); // Duration of ON state
      digitalWrite(LED_BUILTIN, LOW); // Turn off the LED
      delayMicroseconds(TIMING_SPACER_CONSTANT - brightness); // Duration of OFF state
    }
  }
}

void sendPostRequest(String path, unsigned long epoch) {
  Serial.println("======= START HTTP POST =======");

  WiFiClientSecure client;
  client.setInsecure(); // Disables SSL verification

  HTTPClient http;
  http.begin(client, String(serverUrl) + path);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload using ArduinoJson
  StaticJsonDocument<128> jsonDoc;
  jsonDoc["lastTimeEpoch"] = epoch;
  jsonDoc["deviceId"] = DeviceID;
  
  String payload;
  serializeJson(jsonDoc, payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    Serial.print("HTTP request on `");
    Serial.print(path + "` Responded with HTTP-");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode != 200) {
      digitalWrite(LED_BUILTIN, LOW);
      ConnectionError = true;
    } else {
      digitalWrite(LED_BUILTIN, HIGH);
      ConnectionError = false;
    }
    
    String response = http.getString();
    Serial.print("Response Data: ");
    Serial.println(response);
  } else {
    Serial.print("Error sending request: ");
    Serial.println(http.errorToString(httpResponseCode));
    digitalWrite(LED_BUILTIN, LOW);
    ConnectionError = true;
    backupEpochTime = epoch;
    powerCutPacketSendFailed = true;
  }

  http.end();
  Serial.println("======= END HTTP POST =======");
}

bool blinkCount = 0;
void setup() {
  Serial.begin(115200);
  Serial.println("\nCurrent Ache Node V1.0.0");
  Serial.println("Booting....");
  pinMode(LED_BUILTIN,OUTPUT);
  StartUpLEDSequence();
  digitalWrite(LED_BUILTIN,HIGH);
  Serial.println("Starting File System....");
  SPIFFS.begin();
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
    digitalWrite(LED_BUILTIN,blinkCount);
    blinkCount=!blinkCount;
  }
  Serial.println(" ");
  digitalWrite(LED_BUILTIN,HIGH);
  Serial.println("Connected to WiFi");
  Serial.println("Getting Device ID");
  Serial.print("Device ID: ");
  Serial.println(DeviceID);
  timeClient.begin();
  timeClient.setTimeOffset(0);
  sendPostRequest(POST_ENDPOINT,ReadEpochSPIFFS());
  timeClient.update();
  LatestEpochTime = timeClient.getEpochTime();
  sendPostRequest(PING_ENDPOINT,LatestEpochTime);
}
int counter=1;
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    unsigned long startTime = millis();
    if(powerCutPacketSendFailed){
      sendPostRequest(POST_ENDPOINT,backupEpochTime);
      powerCutPacketSendFailed = false;
    }
    if(!ConnectionError){
      digitalWrite(LED_BUILTIN,HIGH);
    }else{
      sendPostRequest(PING_ENDPOINT,LatestEpochTime);
    }
    timeClient.update();
    LatestEpochTime = timeClient.getEpochTime();
    WriteEpochSPIFFS(LatestEpochTime);
    //Sending a ping to the server saying that the node is online
    if(counter==21){
      //Pinging Server Every 5 minutes
      sendPostRequest(PING_ENDPOINT,LatestEpochTime);  
      counter=1;
    }else{
      counter++;
    }
    unsigned long endTime = millis();
    delay((15*1000)-(endTime-startTime)); // Wait for a Minute before updating the time again
  }else{
    if(!ConnectionError){
      digitalWrite(LED_BUILTIN,blinkCount);
      blinkCount=!blinkCount;
      delay(500);
    }
  }
}
