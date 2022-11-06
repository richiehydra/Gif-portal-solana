

import React, { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import idl from "./myepicproject.json"

import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

// Constants
const TWITTER_HANDLE = "_richiehydra";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;


const baseAccount=web3.Keypair.generate();
// Get our program's id from the IDL file.
const programID = new PublicKey("4KBEsT8mw5vnsSPASp2tfFBSya9ymY2NsDPdYa2SfdJD");

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};


  const TEST_GIFS = [
    'https://media1.giphy.com/media/oo6B3CLXtqFck/giphy.gif?cid=ecf05e47h39ngwa4wbc3w86tmax5fx5afcm0c8tgetudl43i&rid=giphy.gif&ct=g',
    'https://media0.giphy.com/media/mc5nIIAuopC1O/giphy.gif?cid=ecf05e47lbroy83xb5j780nzbyvg28m6acv44wh28khb7khd&rid=giphy.gif&ct=g',
    'https://media2.giphy.com/media/87f27TUxOTt3a/giphy.gif?cid=ecf05e47sv9x5hdct1eh2b59t3jqvv104ip5g6sl3y03s2qo&rid=giphy.gif&ct=g',
    'https://media1.giphy.com/media/3PxSmPCeQsVGUl2Q35/giphy.gif?cid=ecf05e47n3yl6m8759vmb2jwaafrkgpq3csk9cov9if2ert0&rid=giphy.gif&ct=g'
  ]
  


const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletConnected();
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");
      // Get gif list from Solana, then set to state
      getGifList();
    }
  }, [walletAddress]);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      console.log("Got the account ", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping!");

      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });

      console.log(
        "Created new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  const checkIfWalletConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet detected!");

          const response = await solana.connect({ onlyIfTrusted: true });
          console.log("Connected wallet:", response.publicKey.toString());

          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("No Solana wallet detected - go get yoself a Phantom wallet!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected wallet:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No GIF link provided!");
      return;
    }
    setInputValue("");
    console.log("GIF link:", inputValue);

    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });

      console.log("GIF successfully sent to program!", inputValue);
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return address.substring(0, 4) + "....." + address.substring(40);
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect Wallet
    </button>
  );

  const renderConnectedContainer = () => {
    if (gifList == null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    } else {
      return (
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendGif();
            }}
          >
            <input
              type="text"
              placeholder="Enter GIF link here"
              value={inputValue}
              onChange={onInputChange}
            />
            <button type="submit" className="cta-button submit-gif-button">
              Submit
            </button>
          </form>

          <div className="gif-grid">
            {gifList.map((item, index) => (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} alt={item.gifLink} />
                <p style={{ color: "white" }}>
                  Added by: {shortenAddress(item.userAddress.toString())}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">Code geass gif</p>
          <p className="sub-text">✨Welcome to the code geass lovers world ✨</p>
          {/* Render Connect Wallet btn here if no wallet connected */}
          {!walletAddress && renderNotConnectedContainer()}
          {/* Render GIFs if wallet connected */}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;