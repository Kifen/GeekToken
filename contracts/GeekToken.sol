pragma solidity >=0.4.22;

import "./IERC20.sol";


library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}


contract GeekToken is IERC20 {
    using SafeMath for uint256;

    string public name;
    string public symbol;
    uint8 public decimals;

    uint256 private totalSupply_;

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    constructor(uint256 _initialSupply) public {
        name = "GeekToken";
        symbol = "GKT";
        decimals = 18;
        totalSupply_ = _initialSupply;
        balances[msg.sender] = totalSupply_;
    }

    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address _tokenOwner) public view returns (uint256) {
        return balances[_tokenOwner];
    }

    function transfer(address _to, uint256 _numTokens) public returns (bool) {
        require(_numTokens <= balances[msg.sender], "Insufficient tokens!");
        balances[msg.sender] = balances[msg.sender].sub(_numTokens);
        balances[_to] = balances[_to].add(_numTokens);
        emit Transfer(msg.sender, _to, _numTokens);
        return true;
    }

    function approve(address _spender, uint256 _tokens) public returns (bool) {
        allowed[msg.sender][_spender] = _tokens;
        emit Approval(msg.sender, _spender, _tokens);
        return true;
    }

    function allowance(address _tokenOwner, address _spender)
        public
        view
        returns (uint256)
    {
        return allowed[_tokenOwner][_spender];
    }

    function transferFrom(address _owner, address _buyer, uint256 _tokens)
        public
        returns (bool)
    {
        require(_tokens <= balances[_owner], "Insufficient tokens!");
        require(
            _tokens <= allowed[_owner][msg.sender],
            "Exceeded approved amount!"
        );

        balances[_owner] = balances[_owner].sub(_tokens);
        allowed[_owner][msg.sender] = allowed[_owner][msg.sender].sub(_tokens);
        balances[_buyer] = balances[_buyer].add(_tokens);
        emit Transfer(_owner, _buyer, _tokens);

        return true;
    }
}
