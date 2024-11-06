import Head from "next/head";
import MemeGallery from "./components/MemeGallery";

const Home = async () => {
  let images: string[] = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}api/meme-images`,
      {
        cache: "no-store", // Ensures fresh data on every request
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    if (!text) {
      throw new Error("Response body is empty");
    }

    images = JSON.parse(text);
  } catch (error) {
    console.error("Error fetching images:", error);
    images = []; // Return an empty array in case of error
  }

  return (
    <div>
      <Head>
        <title>$NOEAR MEME DEPOSIT</title>
        <meta name="description" content="A gallery of memes from a $noear" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto bg-black">
        <div className="flex items-center justify-center mt-4 gap-4">
          <img src="/illia.gif" alt="GIF" className="w-24 h-24" />
          <h1 className="text-3xl font-bold text-center my-8">
            $NOEAR MEME DEPOSIT
          </h1>
          <img src="/illia.gif" alt="GIF" className="w-24 h-24" />
        </div>

        <MemeGallery images={images} />
      </main>
    </div>
  );
};

export default Home;
