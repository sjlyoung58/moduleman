SELECT distinct shiptype, shiptypel 
  FROM v_stored_ships 
 where replace(shiptype,'_','$') like '%$%';
