import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Contract, providers } from 'ethers';
import Web3Modal from 'web3modal';
import {
    VOTING_FACTORY_CONTRACT_ADDRESS,
    VOTING_FACTORY_ABI,
    VOTING_POLL_ABI
  } from "../constants";

const Home = () => {

    const CHAIN_ID = 3;
    const NETWORK_NAME = "ropsten";

    const [votingPolls, setVotingPolls] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [numVotingPolls, setNumVotingPolls] = useState(0);
    const [loading, setLoading] = useState(false);
    const [voteLoading, setVoteLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState("");
    const [walletConnected, setWalletConnected] = useState(false);
    const [enteredTitle, setEnteredTitle] = useState('');
    const [enteredOptions, setEnteredOptions] = useState('');
    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState(null)
    const web3ModalRef = useRef();


    // Helper function to fetch a Provider instance from Metamask
    const getProvider = useCallback(async () => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);
        const getSigner = web3Provider.getSigner();

        const { chainId } = await web3Provider.getNetwork();

        setAccount(await getSigner.getAddress());
        setWalletConnected(true)


        if (chainId !== CHAIN_ID) {
        window.alert(`Please switch to the ${NETWORK_NAME} network!`);
            throw new Error(`Please switch to the ${NETWORK_NAME} network`);
        }
        setProvider(web3Provider);
    }, []);

    // Helper function to fetch a Signer instance from Metamask
    const getSigner = useCallback(async () => {
        const web3Modal = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(web3Modal);

        const { chainId } = await web3Provider.getNetwork();


        if (chainId !== CHAIN_ID) {
        window.alert(`Please switch to the ${NETWORK_NAME} network!`);
            throw new Error(`Please switch to the ${NETWORK_NAME} network`);
        }
        
        const signer = web3Provider.getSigner();
        return signer;
            
        
    }, []);

    // Helper function to return a VotingFactory Contract instance
    // given a Provider/Signer
    const getVotingFactoryInstance = useCallback((providerOrSigner) => {
        return new Contract(
            VOTING_FACTORY_CONTRACT_ADDRESS,
            VOTING_FACTORY_ABI,
            providerOrSigner
        );
    },[]);

    // Helper function to return a VotingPoll Contract instance // receiving the contract address as argument
    // given a Provider/Signer
    const getVotingPollInstance = useCallback((providerOrSigner, votingPollContractAddress) => {
        return new Contract(
            votingPollContractAddress,
            VOTING_POLL_ABI,
            providerOrSigner
        )
    },[])

    const getNumVotingPolls = useCallback(async () => {
        try {
            const contract = getVotingFactoryInstance(provider);
            const totalNumVotingPolls = await contract.allVotingPolls();
            setNumVotingPolls(totalNumVotingPolls.toString());
        } catch (error) {
            console.error(error);
        }
    },[getVotingFactoryInstance, provider])

    const hasVoted = useCallback(async (pollAddress) => {
        try {
            const votingPollContract = getVotingPollInstance(provider, pollAddress);
            const userVoted = await votingPollContract.hasVote(account);
            return userVoted;
        } catch (error) {
            console.error(error);
        }
    },[account, provider, getVotingPollInstance])


    const getAllVotingPolls = useCallback(async () => {
        try {
            const factroryContract = getVotingFactoryInstance(provider);
            const allPolls = await factroryContract.getAllVotingPolls();

            const polls = [];

            if(allPolls.length > 0){
                allPolls.map(async (poll) => {
                    const votingPollContract = getVotingPollInstance(provider,poll);
                    const title = await votingPollContract.title();
                    const options = await votingPollContract.fetchCandidates();

                    const userVoted = await hasVoted(poll);

                    const pollDetails = {
                        address: poll,
                        title: title,
                        options: options,
                        voted: userVoted
                    };

                    polls.push(pollDetails)
                });
            }

            setVotingPolls(polls);

        } catch (error) {
            console.error(error);
        }
    }, [getVotingFactoryInstance, getVotingPollInstance, hasVoted, provider]);

    const connectWallet = useCallback(async () => {
        try {
            web3ModalRef.current = new Web3Modal({
                network: NETWORK_NAME,
                providerOptions: {},
                disableInjectedProvider: false,
            });

            await getProvider();
        } catch (error) {
            console.error(error);
        }
    },[getProvider])

    useEffect(() => {

        const fetchPolls = async () => {
            if(account && provider){
                await getNumVotingPolls();
                await getAllVotingPolls();
            }
        }

        fetchPolls()
    
    }, [account, provider, getNumVotingPolls, getAllVotingPolls])


    const createPoll = async (e) => {
        e.preventDefault();

        if(enteredTitle === "" || enteredOptions === ""){
            alert("Poll title and options must be entered");
        } else {
            try {
                const optionsArray = enteredOptions.split(',');
                const signer = await getSigner();
                const factoryContract = getVotingFactoryInstance(signer);
                const txn = await factoryContract.createPoll(enteredTitle, optionsArray);
                setLoading(true);
                await txn.wait();
                await getNumVotingPolls();
                await getAllVotingPolls();
                setLoading(false);
                setEnteredTitle('');
                setEnteredOptions('');
            } catch (error) {
                console.error(error);
                window.alert(error.data.message);
            }
        }
    }


    const titleChangeHandler = (e) => {
        setEnteredTitle(e.target.value);
    }

    const optionsChangeHandler = (e) => {
        setEnteredOptions(e.target.value);
    }

    const optionChangeHandler = (e) => {
        setSelectedOption(+e.target.value);
    }

    const voteClickHandler = async (e, pollContractAddress) => {
        e.preventDefault();

        if(selectedOption === "") {
            alert('Select a voting option');
        } else {
            try {
                const signer = await getSigner();
                const VotingPollContract = getVotingPollInstance(signer, pollContractAddress);
                const txn = await VotingPollContract.vote(+selectedOption);
                setVoteLoading(true);
                await txn.wait();
                await getAllVotingPolls();
                setSelectedOption('');
                setVoteLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
    }


    useEffect(() => {
        if(!walletConnected) {
            connectWallet();
        }
    }, [walletConnected, connectWallet]);

    const renderCreatePollTab = () => {
        if(loading) {
            return (
                <div className="mt-4">
                    Loading... Waiting for transaction...
                </div>
            );
        } else {
            return (
                <div className="mt-4">
                  <form>
                      <div className="form-group">
                        <label htmlFor="pollTitle">Poll Title</label>
                        <input type="text" id="pollTitle" value={enteredTitle} onChange={titleChangeHandler} className="form-control" placeholder="Best innovator" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="options">Voting Options: separated by commas: option1,option2,option3</label>
                        <input type="text" id="options" value={enteredOptions} onChange={optionsChangeHandler} className="form-control" placeholder="Vitalik,Jack,Satoshi" />
                      </div>
                      <button onClick={createPoll} className="btn btn-primary">Create Poll</button>
                  </form>
                </div>
            );
        }
    }

    function renderViewPollsTab() {
        return (
            <div className="mt-4">
                <h5>Voting Polls:</h5>
                {votingPolls.length > 0 && votingPolls.map((poll) => (
                    <div key={poll.address} className="card mb-3">
                        <div className="card-body">
                            <p><strong>Voting Poll Adress:</strong> {poll.address}</p>
                            <p><strong>Voting Poll Title:</strong> {poll.title}</p>
                            <form>
                                {poll.options.length > 0 && poll.options.map((option, index) => (
                                    <p key={poll.address.concat(index)} className="font-weight-bold text-primary" style={{fontSize: '20px'}}>
                                    {option.name} {" "} <input value={index} disabled={poll.voted ? "disabled" : ""} type="radio" name="pollOption" onChange={optionChangeHandler} /> {" "}
                                    <span className="ml-5" style={{fontSize: '16px', color: '#000', display: 'inline-block'}}>{poll.voted ? `${option.voteCount.toNumber()} votes` : ""}</span>
                                    </p>
                                ))}

                                {!voteLoading ? 
                                    <button onClick={(e) => voteClickHandler(e, poll.address)} disabled={poll.voted ? "disabled" : ""} className="btn btn-primary btn-block">{poll.voted ? "Already Voted" : "Vote"}</button> 
                                    : 
                                    <div className="mt-4">
                                        Loading... Waiting for transaction...
                                    </div>    
                                }
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        ); 
    }

    const renderTabs = () => {
        if (selectedTab === "Create Poll") {
          return renderCreatePollTab();
        } else if (selectedTab === "View Polls") {
          return renderViewPollsTab();
        }
        return null;
    };
    
    return (
        <div className="row" style={{ alignItems: 'center' }}>
            <div className="col-md-6">
                <h1>GoVote dApp</h1>
                <h4>A simple voting decentralized app</h4>
                <p>Want to vote? Click on view polls and vote accordingly or create a poll for others to vote.</p>
                {!walletConnected ? 
                    <button className="btn btn-danger btn-lg" onClick={connectWallet}>Connect Wallet</button> : 
                    <div>
                        <p>Total Voting Polls: {numVotingPolls}</p>
                        <div className="">
                            <button className="btn btn-info" onClick={() => setSelectedTab("Create Poll")}>Create Polls</button> {" "}
                            <button className="btn btn-dark" onClick={() => setSelectedTab("View Polls")}>View Polls</button>
                        </div>
                        {renderTabs()}
                    </div>
                }
            </div>
            <div className="col-md-6">
                <img src="images/0x0.jpeg" className="img-fluid" alt="" />
            </div>
        </div>
    );
}

export default Home;