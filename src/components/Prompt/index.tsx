import { redirect } from "next/navigation";
import { apiKeyName } from "../Credentials";
import { ClientPromptForm } from "./Client";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { randomUUID } from "crypto";
import { S3 } from "aws-sdk";
import { ImageGenerateParams } from "openai/resources/images.mjs";
import Link from "next/link";

const promptName = "openai-prompt";
const resolutionName = "openai-resolution";
const styleName = "openai-style";
const qualityName = "openai-quality";

export const maxDuration = 300;

const action = async (data: FormData) => {
  "use server";

  const prompt = data.get(promptName) as string;
  const resolution =
    (data.get(resolutionName) as ImageGenerateParams["size"]) ?? "1792x1024";
  const style =
    (data.get(styleName) as ImageGenerateParams["style"]) ?? "vivid";
  const quality =
    (data.get(qualityName) as ImageGenerateParams["quality"]) ?? "standard";

  cookies().set(promptName, prompt);
  cookies().set(resolutionName, resolution);
  cookies().set(styleName, style);
  cookies().set(qualityName, quality);

  const apiKey = cookies().get(apiKeyName)?.value;

  const openai = new OpenAI({
    apiKey,
  });

  if (!apiKey) {
    return redirect(
      `/error?message=${encodeURIComponent("No API key provided")}`
    );
  }

  // For testing purposes
  // let imageUrl = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-yKtLP3i376mUjM5i75EBUvf4/user-h7562yzvhFi5GOwtRJ2oph0m/img-BaZCmBydN6G8AlpMXA7ZCqCw.png?st=2025-01-18T01%3A33%3A55Z\&se=2025-01-18T03%3A33%3A55Z\&sp=r\&sv=2024-08-04\&sr=b\&rscd=inline\&rsct=image/png\&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8\&sktid=a48cca56-e6da-484e-a814-9c849652bcb3\&skt=2025-01-18T00%3A11%3A55Z\&ske=2025-01-19T00%3A11%3A55Z\&sks=b\&skv=2024-08-04\&sig=iskRni4tKxYpMTrzcQBPYwR546io1ny4IPIZjRAQ5EA%3D"
  
  let imageUrl = "";

  try {
    console.log("running...", quality, resolution, style);
    const res = await openai.images.generate({
      prompt,
      model: "dall-e-3",
      n: 1,
      quality,
      response_format: "url",
      size: resolution,
      style,
    });

    imageUrl = res?.data?.[0]?.url || "";

    console.log(res)

  } catch (error: any) {
    return redirect(`/error?message=${encodeURIComponent(error.message)}`);
  }

  return redirect(imageUrl);
  // return redirect(
  //   `/done?imageUrl=${encodeURIComponent(imageUrl)}&resolution=${resolution}\&style=${style}\&quality=${quality}`
  // );
};

export const PromptForm = () => {
  const promptValue = cookies().get(promptName)?.value ?? "";
  const resolutionValue = cookies().get(resolutionName)?.value ?? "1792x1024";
  const styleValue = cookies().get(styleName)?.value ?? "vivid";
  const qualityValue = cookies().get(qualityName)?.value ?? "standard";
  const apiKey = cookies().get(apiKeyName)?.value;

  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="text-sm pt-2 opacity-60">
        Note: OpenAI modifies your prompt automatically. This cannot be
        disabled, but you can add this to the beginning of your prompt to
        override the behavior:
      </p>
      <code className="text-sm bg-[rgb(0,0,0,0.1)] p-2 rounded-lg opacity-60">
        I NEED to test how the tool works with extremely simple prompts. DO NOT
        add any detail, just use it AS-IS:
      </code>
      <span className="flex flex-col gap-2">
        <label htmlFor={promptName} className="text-sm opacity-50">
          Prompt
        </label>
        <textarea
          defaultValue={promptValue}
          placeholder="Prompt"
          name={promptName}
          className="bg-[rgba(0,0,0,0.2)] rounded-lg shadow-md text-white p-2 w-full h-64"
        />
      </span>
      <div className="flex flex-col sm:flex-row gap-4">
        <span className="flex flex-col">
          <label htmlFor={resolutionName} className="text-sm opacity-50 pb-2">
            Resolution
          </label>
          <select
            name={resolutionName}
            defaultValue={resolutionValue}
            className="bg-[rgba(0,0,0,0.2)] rounded-lg shadow-md text-white p-2"
          >
            <option value="1792x1024">1792x1024</option>
            <option value="1024x1024">1024x1024</option>
            <option value="1024x1792">1024x1792</option>
          </select>
        </span>
        <span className="flex flex-col">
          <label htmlFor={styleName} className="text-sm opacity-50 pb-2">
            Style
          </label>
          <select
            name={styleName}
            defaultValue={styleValue}
            className="bg-[rgba(0,0,0,0.2)] rounded-lg shadow-md text-white p-2"
          >
            <option value="vivid">Vivid</option>
            <option value="natural">Natural</option>
          </select>
        </span>
        <span className="flex flex-col">
          <label htmlFor={qualityName} className="text-sm opacity-50 pb-2">
            Quality
          </label>
          <select
            name={qualityName}
            defaultValue={qualityValue}
            className="bg-[rgba(0,0,0,0.2)] rounded-lg shadow-md text-white p-2"
          >
            <option value="standard">Standard</option>
            <option value="hd">HD</option>
          </select>
        </span>
      </div>
      <ClientPromptForm
        disabled={!apiKey}
        className="whitespace-nowrap bg-[rgba(0,0,0,0.5)] p-2 rounded-lg hover:bg-[rgba(0,0,0,0.7)]"
      >
        Generate
      </ClientPromptForm>
      <Link
        className="text-center text-sm opacity-70"
        href="https://platform.openai.com/docs/api-reference/images/create"
        target="_blank"
      >
        read the docs
      </Link>
    </form>
  );
};
