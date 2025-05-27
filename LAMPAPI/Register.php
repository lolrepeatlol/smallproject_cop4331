<?php

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

            // Check if the insertion was successful
            if ($stmt->affected_rows > 0) {
                $newUserId = $conn->insert_id; // <-- GET THE LAST INSERTED ID HERE

                // Pass the ID to a function that will include it in the JSON response
                // I've modified returnWithInfo to also accept ID, or you can create a new function.
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
		// When there's an error, typically you'd return ID as 0 or null
		$retValue = '{"id":0, "firstName":"", "lastName":"", "error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	// MODIFIED: New function or enhanced returnWithInfo to include ID
    function returnWithSuccess( $id, $firstName, $lastName, $msg )
    {
        $retValue = '{"id":' . $id . ', "firstName":"' . $firstName . '", "lastName":"' . $lastName . '", "error":"", "message":"' . $msg . '"}';
        sendResultInfoAsJson( $retValue );
    }

?>