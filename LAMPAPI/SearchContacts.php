<?php

header("Access-Control-Allow-Origin: http://ucfgroup9.xyz");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);    
    exit();
}

    $inData = getRequestInfo();
    
    $searchResults = "";
    $searchCount = 0;

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error)    
    {
        returnWithError( $conn->connect_error );
    }    
    else
    {
        $stmt = $conn->prepare("select ID, FirstName, LastName, Phone, Email from Contacts where (FirstName like ? OR LastName like ? OR Phone like ? OR Email like ?) and UserID=?");
        $searchInput = "%" . $inData["search"] . "%";
        $stmt->bind_param("sssss", $searchInput, $searchInput, $searchInput, $searchInput, $inData["userId"]);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        while($row = $result->fetch_assoc())
        {
            if( $searchCount > 0 )
            {
                $searchResults .= ",";
            }
            $searchCount++;
            $searchResults .= '{"ID":' . $row["ID"] . ', "FirstName" : "' . $row["FirstName"]. '", "LastName" : "' . $row["LastName"]. '", "Phone" : "' . $row["Phone"]. '", "Email" : "' . $row["Email"]. '"}';
        }
        
        if( $searchCount == 0 )
        {
            returnWithError( "No Records Found" );
        }
        else
        {
            returnWithInfo( $searchResults );
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
        $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
    
    function returnWithInfo( $searchResults )
    {
        $retValue = '{"results":[' . $searchResults . '],"error":""}';
        sendResultInfoAsJson( $retValue );
    }
    
?>
