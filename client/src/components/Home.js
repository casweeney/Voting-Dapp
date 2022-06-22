import React, { useEffect, useRef, useState } from 'react';
import { Contract, providers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import Web3Modal from 'web3modal';
import {
    VOTING_FACTORY_CONTRACT_ADDRESS,
    VOTING_FACTORY_ABI
  } from "../constants";

const Home = () => {

    //const [votingPolls, setVotingPolls] = useState([]);
    const [numVotingPolls, setNumVotingPolls] = useState(0);
    const [loading, setLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();

    const connectWallet = async () => {
        try {
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (error) {
            console.log(error);
        }
    }

    const getNumVotingPolls = async () => {
        try {
            const provider = await getProviderOrSigner();
            const contract = getVotingFactoryInstance(provider);
            const totalNumVotingPolls = await contract.allVotingPolls();
            setNumVotingPolls(totalNumVotingPolls.toString());
        } catch (error) {
            console.log(error);
        }
    }

    const createPoll = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const factoryContract = getVotingFactoryInstance(signer);
            const txn = await factoryContract.createPoll("First Poll", ["peter", "atiku", "tinubu"]);
            setLoading(true);
            await txn.wait();
            await getNumVotingPolls();
            setLoading(false);
        } catch (error) {
            console.error(error);
            window.alert(error.data.message);
        }
    }


    // Helper function to fetch a Provider/Signer instance from Metamask
    const getProviderOrSigner = async (needSigner = false) => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 3) {
        window.alert("Please switch to the Ropsten network!");
            throw new Error("Please switch to the Rinkeby network");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };

    // Helper function to return a VotingFactory Contract instance
    // given a Provider/Signer
    const getVotingFactoryInstance = (providerOrSigner) => {
        return new Contract(
            VOTING_FACTORY_CONTRACT_ADDRESS,
            VOTING_FACTORY_ABI,
            providerOrSigner
        );
    };

    useEffect(() => {
        if(!walletConnected) {
            web3ModalRef.current = new Web3Modal({
                network: "ropsten",
                providerOptions: {},
                disableInjectedProvider: false,
            });

            connectWallet().then(() => {
                getNumVotingPolls();
            });
        }
    }, [walletConnected]);
    
    return (
        <div className="row">
            <div className="col-md-6">
                <h2>Hello Hi</h2>
                {!walletConnected ? 
                    <button className="btn btn-danger btn-lg" onClick={connectWallet}>Connect Wallet</button> : 
                    <div>
                        <p>Total Voting Polls: {numVotingPolls}</p>
                        <button onClick={createPoll} className="btn btn-info">Create Poll</button>
                    </div>
                }
            </div>
            <div className="col-md-6">
                <img src="images/3.jpg" className="img-fluid" alt="" />
            </div>
        </div>
    );
}

export default Home;