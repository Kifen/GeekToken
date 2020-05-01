pragma solidity >=0.4.22;


interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address _tokenOwner) external view returns (uint256);

    function allowance(address _tokenOwner, address _spender)
        external
        view
        returns (uint256);

    function transfer(address _to, uint256 _tokens) external returns (bool);

    function approve(address _spender, uint256 _tokens) external returns (bool);

    function transferFrom(address _from, address _to, uint256 _tokens)
        external
        returns (bool);

    event Approval(
        address indexed tokenOwner,
        address indexed spender,
        uint256 tokens
    );
    event Transfer(address indexed from, address indexed to, uint256 tokens);
}
