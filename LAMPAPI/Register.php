<?php

$allowed_origins = [
    "http://ucfgroup9.xyz",
    "https://app.swaggerhub.com"
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}

//other CORS headers
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204); 
    exit();
}

	$inData = getRequestInfo();

	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$login = $inData["login"];
	$password = $inData["password"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		//check for duplicate login
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
		$stmt->bind_param("s", $login);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $result->num_rows > 0 )
		{
			returnWithError("Username already taken");
		}
		else
		{
			$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES(?,?,?,?)");
			$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
			$stmt->execute();

            //check if the insertion was successful
            if ($stmt->affected_rows > 0) {
                $newUserId = $conn->insert_id; //get last inserted id

                //pass id to a function that will include it in the json response
                returnWithSuccess($newUserId, $firstName, $lastName, "User registered successfully");
            } else {
                returnWithError("Registration failed. Could not create user.");
            }
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"id":0, "firstName":"", "lastName":"", "error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

    function returnWithSuccess( $id, $firstName, $lastName, $msg )
    {
        $retValue = '{"id":' . $id . ', "firstName":"' . $firstName . '", "lastName":"' . $lastName . '", "error":"", "message":"' . $msg . '"}';
        sendResultInfoAsJson( $retValue );
    }

?>
