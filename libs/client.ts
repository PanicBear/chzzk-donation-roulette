import { ChzzkClient } from "chzzk";

const options = {
  baseUrls: {
    chzzkBaseUrl: "https://api.chzzk.naver.com",
    gameBaseUrl: "https://comm-api.game.naver.com/nng_main",
  },
  nidAuth: "ekHv47awcYRp5rFE3/jKeRqQUJx3Cgf/57/olkkEG90xavTlt+UNSONID8wkcEv5",
  nidSession:
    "AAABkrlBzbeR7SZYejR0Wenmz8zq2NqqzdoNXtsZqt36kGsY1uk9IUCRwGfd702QwYk6ZgHm+C5R7xFqofn8fNyRMVczCH365UxI+vIJ5TVqQ4rqG3RqlYRNBMX44Q41njSRKeFftqPZVomO6pZxh8mVXYSVboIXZeBaqq1+MNkRvhou1SLEq+5QOO5Y9kMuDtIvQWoRm6zR4vqyPtGNmEinpR0Vn11SGsR05YzcU4Emjugjm80bFLaKBNUDQgJrEgNzirxJEc4Ao1myxSB4ikSFUi7eUT1JOa2tH69tL4xJtQD7NnzyuLzRrWWtCvxNQuNFfEBpUajnfs9eMImQXxVAiBCruRw+qW1XBPw0FMoxNtXCy9KI1aBzoPE860GGSIB0s8kCYNv78QFRBopfdjM5LqkqK4LKU0Ix8hr5W9xrH2M/yqLQLLJmCIbFBxCQw2nTmTSKlPyPV6lhs2KJnIw3posLQsXxG81eJxWmGTmJRDRx4+Vqtr6v6h5toFT3+sGHmWuGXupVBRYDpZdQUnudLGsk2PE0I9NgucCGlB9/eKFW",
};

const client = new ChzzkClient(options);

export default client;
