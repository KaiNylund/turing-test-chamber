import OpenAI from 'openai-api';
import { setServerErrCode } from './server.js';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY ||
                      ""; // Your key here
const openai = new OpenAI(OPENAI_API_KEY);

const GPT3_ERR_CODE = 503;
const GPT_ERR_TEXT = "Request to GPT-3 failed. Service may be temporarily unavailable";

export async function getGPT3Response(prompt) {
  let formattedPrompt = prompt.replace(/[!@#$%^&*]/g, "").trim();
  return openai.complete({
    engine: 'davinci',
    prompt: formattedPrompt,
    maxTokens: 10 + Math.floor(Math.random() * 30),
    temperature: Math.random() / 5.0,
    topP: 1,
    presencePenalty: 2.0,
    frequencyPenalty: 2.0,
    bestOf: 1,
    n: 1,
    stream: false,
    stop: ["."]
  }).then((gptResponse) => {
    let resp = gptResponse.data;
    let formattedRespText = resp.choices[0].text.replace(/[”]+|[“]+|(\n)|(\s\s+)/g, '');
    if (formattedRespText[0] == ',') {
      formattedRespText = formattedRespText.substring(1);
    }
    return formattedRespText.trim();
  }).catch(() => {
    setServerErrCode(GPT3_ERR_CODE);
    throw GPT_ERR_TEXT;
  });
}