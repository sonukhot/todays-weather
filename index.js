const alexa = require('ask-sdk-core')
const skillBuilder = alexa.SkillBuilders.custom()
const axios = require('axios')

async function getDataForWeatherByCity(city) {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${process.env.apiKey}&units=imperial`

    const response = await axios.get(url)

    return response.data

}
const WeatherIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'WeatherIntent'
    },
    async handle(handlerInput) {
        const city = handlerInput.requestEnvelope.request.intent.slots.city.value

        const data = await getDataForWeatherByCity(city)
        var weatherData = data['weather']
        var weatherDetails = ""
        for (var i = 0; i < weatherData.length; i++) {
            if (i > 0) {
                weatherDetails = weatherDetails + " and "
            }
            weatherDetails = weatherDetails + weatherData[i].description
        }
        const answer = `Currently in ${city} it is${weatherDetails} and ${data.main.temp} degree farenheit, With high of ${data.main.weather.temp_max} and low of ${data.main.temp_min} degree farenheit. `
        const reprompt = 'Would you like more weather info for another city?'

        return handlerInput.responseBuilder
            .speak(answer + reprompt)
            .reprompt(reprompt)
            .withShouldEndSession(false)
            .getResponse()
    },
};
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Welcome, to Todays weather. For which city current weather information would you like? ")
            .reprompt("Would you like to know weather for any city?")
            .withShouldEndSession(false)
            .getResponse()
    },
};
const CancelAndStopIntentsHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Thank you for using Todays Weather")
            .withShouldEndSession(true)
            .getResponse()
    },
}
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent'
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("I'm sorry, I didn't quite catch that. Which city weather information would you like?")
            .reprompt("Weather for which city would you like?")
            .withShouldEndSession(false)
            .getResponse()
    },
}
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Todays weather can get you current weather for a city. You can say 'What is the weather in Boston?' to me")
            .reprompt("Todays weather can get you current weather for a city. You can say 'What is the weather in Boston?' to me")
            .withShouldEndSession(false)
            .getResponse()
    },
};
const NoIntent = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent'
    },
    handle(handlerInput) {
        const speechText = 'Got you. Have a nice day. '

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse()
    },
};

const YesIntent = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
    },
    handle(handlerInput) {
        const speechText = 'Okay. For which city, todays weather information would you like? '
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse()
    },
};

const ExitHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'

    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        return responseBuilder
            .speak('Talk to you later!')
            .withShouldEndSession(true)
            .getResponse()
    },
}

const ErrorHandler = {
    canHandle() {
        return true
    },
    handle(handlerInput) {

        return handlerInput.responseBuilder
            .speak('Sorry I can\'t understand the command. Please say again.')
            .reprompt('Sorry I can\'t understand the command. Please say again.')
            .withShouldEndSession(false)
            .getResponse()

    },
};

exports.handler = skillBuilder
    .addRequestHandlers(WeatherIntentHandler, YesIntent, CancelAndStopIntentsHandler, FallbackIntentHandler, LaunchRequestHandler, HelpIntentHandler, NoIntent, ExitHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda()