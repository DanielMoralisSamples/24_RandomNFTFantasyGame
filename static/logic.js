Moralis.initialize("JzMDtI9JeuUMAtiJalAqQbenxGpU5QVH6dCUaxK6"); // Application id from moralis.io
Moralis.serverURL = "https://axsxr6qx1ncv.moralishost.com:2053/server"; //Server url from moralis.io

const nft_contract_address = "0x0Fb6EF3505b9c52Ed39595433a21aF9B5FCc4431" //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.
/*
Available deployed contracts
Ethereum Rinkeby 0x0Fb6EF3505b9c52Ed39595433a21aF9B5FCc4431
Polygon Mumbai 0x351bbee7C6E9268A1BF741B098448477E08A0a53
BSC Testnet 0x88624DD1c725C6A95E223170fa99ddB22E1C6DDD
*/
initializeWeb3()
const web3 = new Web3(window.ethereum);


//Step 1 Initialize Web3
async function initializeWeb3(){ 
    Moralis.authenticate();
    activateControls();
}

function activateControls() {
    document.getElementById("characterName").removeAttribute("disabled");
    document.getElementById("getCharacter").removeAttribute("disabled");
}

//Step 2 Generate Character
async function getCharacter(){
    const configArray = getRandomValues();
    const characterIndex = (configArray[0]%5)+1;
    const weaponIndex = (configArray[1]%5)+1;
    const character = await mapCharacter(characterIndex);
    const weapon = mapCharacterWeapon(weaponIndex);
    const characterName = document.getElementById("characterName").value
    const metadata = {
        "name":characterName,
        "role":character["Role"],
        "image":character["URI"],
        "weapon":weapon,
        "attack":(configArray[2]%100)+1,
        "defense":(configArray[3]%100)+1
    }
    const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await metadataFile.saveIPFS();
    const metadataURI = metadataFile.ipfs();
    displayNFT(metadataURI);
    const txt = await mintToken(metadataURI).then(console.log)
}

function getRandomValues(){
    let array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    return array;
}

async function mapCharacter(characterIndex){
    const images = await fetch("static/ipfsCollection.json")
    const ipfsUris = await images.json()
    const role = {
        1:"Warrior",
        2:"Thief",
        3:"Elf",
        4:"Hobbit",
        5:"Wizard"
    }
    return {"Role":role[characterIndex],"URI":ipfsUris[characterIndex]}
}

function mapCharacterWeapon(weaponIndex){
    weapons = {
        1:"Sword",
        2:"Dagger",
        3:"Mace",
        4:"Staff",
        5:"Spear"
    }
    return weapons[weaponIndex];
}

async function displayNFT(metadataUri){
    const metadata = await fetch(metadataUri);
    nftData = await metadata.json();
    nftNameTag = `<h4>${nftData["name"]}</h4>`
    nftImageTag = `<div class="container">
                        <div class="col-sm-">                
                            <img src=${nftData["image"]} class="img-fluid" >
                        </div>
                    </div>`
    nftRoleTag = `<h5>Role: ${nftData["role"]}</h5>`
    nftWeaponTag = `<h5>Weapon of Choice: ${nftData["weapon"]}</h5>`
    nftAttackTag = ` <h5>Attack</h5>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: ${nftData["attack"]}%"></div>
                    </div>`
    nftDefenseTag = `<h5>Defense</h5>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: ${nftData["defense"]}%"></div>
                    </div>`              
    document.getElementById("displayNFT").innerHTML = ""
    document.getElementById("displayNFT").innerHTML += nftNameTag;
    document.getElementById("displayNFT").innerHTML += nftImageTag;
    document.getElementById("displayNFT").innerHTML += nftRoleTag;
    document.getElementById("displayNFT").innerHTML += nftWeaponTag;
    document.getElementById("displayNFT").innerHTML += nftAttackTag;
    document.getElementById("displayNFT").innerHTML += nftDefenseTag;
}


async function mintToken(_uri){
  const encodedFunction = web3.eth.abi.encodeFunctionCall({
    name: "mintToken",
    type: "function",
    inputs: [{
      type: 'string',
      name: 'tokenURI'
      }]
  }, [_uri]);

  const transactionParameters = {
    to: nft_contract_address,
    from: ethereum.selectedAddress,
    data: encodedFunction
  };
  const txt = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [transactionParameters]
  });
  return txt
}

