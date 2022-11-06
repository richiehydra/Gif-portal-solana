const anchor = require('@project-serum/anchor');
const {SystemProgram}=anchor.web3;
const main = async() => {
  console.log("🚀 Starting test...")

  const provider=anchor.AnchorProvider.env();
  anchor.setProvider(provider)
  const program = anchor.workspace.Myepicproject;
  

  const baseAccount=anchor.web3.Keypair.generate();

  const tx = await program.rpc.startStuffOff({
    accounts:
    {
      baseAccount:baseAccount.publicKey,
      user:provider.wallet.publicKey,
      systemProgram:SystemProgram.programId,
    },
    signers:[baseAccount],
  });
  
  let account=await program.account.baseAccount.fetch(baseAccount.publicKey);

  console.log("Gifs Count is 😍",account.totalGifs.toString());
  console.log("📝 Your transaction signature", tx);
  const secondtx=await program.rpc.addGif("add a gif link",{
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    },
  });
  
  account =await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log("Gifs Count is 😍",account.totalGifs.toString());
  console.log("📝 Your transaction signature", secondtx)
  console.log('👀 GIF List', account.gifList)



}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();