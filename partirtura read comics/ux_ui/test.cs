public async Task<NumberDetailDto> UpdateNumberAsync(long numberId, UpdateNumberRequest request, CancellationToken cancellationToken = default)
    {
        /* No tiene sentido esta validación.
		Directamente obtengo el número, si es NULL, se corta.
		if (numberId <= 0)
        {
            throw new ValidationException("El identificador del número es obligatorio.");
        }
		*/
		
		/* Primero validamos, para que ir a la BD si no tengo los datos, no? */
		if (string.IsNullOrWhiteSpace(request.NumberValue))
        {
            throw new ValidationException("El número es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ValidationException("El título es obligatorio.");
        }
		
		/* PORQUE SERIES y NO SERIE? raro. */
		var existing = await _numberRepository.GetBySeriesAndNumberAsync(number.Series, numberValue, cancellationToken);
        if (existing is not null && existing.Id != numberId)
        {
            throw new BusinessConflictException("Ya existe un número con el mismo valor en esta serie.");
        }
		
		var language = await _languageRepository.GetByIdAsync(request.LanguageId, cancellationToken)
            ?? throw new BusinessNotFoundException("El idioma no existe.");
		
        //Con esta alcanza, si es null no existe, punto.
		var number = await _numberRepository.GetByIdAsync(numberId, cancellationToken)
            ?? throw new BusinessNotFoundException("El número no existe.");

        //No sé que es esto?
		//Para que esta linea?
		await _numberRepository.LoadRelationsAsync(number, cancellationToken);

		/* Para que esto? */
        //var numberValue = request.NumberValue.Trim();
        //var title = request.Title.Trim();

		Number? prev = null;
		if (request.PreviousNumberId.HasValue)
        {
            prev = await _numberRepository.GetByIdAsync(request.PreviousNumberId.Value, cancellationToken);
            if (prev is null || prev.Series != number.Series)
            {
                throw new BusinessNotFoundException("El número anterior no existe o no pertenece a la misma serie.");
            }
        }

		Number? next = null;
        if (request.NextNumberId.HasValue)
        {
            next = await _numberRepository.GetByIdAsync(request.NextNumberId.Value, cancellationToken);
            if (next is null || next.Series != number.Series)
            {
                throw new BusinessNotFoundException("El número siguiente no existe o no pertenece a la misma serie.");
            }
        }

        number.NumberValue = request.NumberValue.Trim();;
        number.Title = request.Title.Trim();
        number.Description = request.Description?.Trim();
        number.Language = language;
        number.PublicationDate = request.PublicationDate;

        if (request.CoverData is not null && request.CoverData.Length > 0)
        {
			//Supongo que en _imageUploadService no se guarda en BD ni nada, no?
            number.Cover = await _imageUploadService.ReplaceAsync(number.Cover, request.CoverData, request.CoverFileName ?? "cover.webp", ImageType.Cover, cancellationToken);
            await _imageRepository.UpdateAsync(number.Cover, cancellationToken);
        }
        else if (request.ImageId == 0 && number.Cover is not null)
        {
            var oldImage = number.Cover;
            number.Cover = null;
            await _imageUploadService.RemoveAsync(oldImage, cancellationToken);
			await _imageRepository.Remove(oldImage, cancellationToken);
        }

		/* Paso 1: Todos los que tengo en mi lista, pero no tengo en el request, hay que eliminar. */
		List<PersonByRole> removeList = new List<PersonByRole>();
		foreach(PersonByRole personByRole in number.PersonByRoles)
		{	
			bool exist = false;
			foreach(PersonByRoleRequest personByRoleRquest in request)
			{
				if(personByRoleRquest.Id == personByRole.Id)
				{
					exist = true;
					break;
				}
			}
			
			if(!exist)
			{
				//Opcion 1.
				removeList.Add(personByRole);
				
				/* OPCION 2.
				personByRole.IsActive = false
				*/
			}
		}
		
		foreach(PersonByRole personByRole in removeList)
		{
			number.PersonByRoles.Remove(personByRole);
		}

		/* Paso 2: Todos los que tienen id 0 son nuevos. */
		foreach(PersonByRoleRequest personByRoleRquest in request)
		{
			if(personByRoleRquest.Id == 0)
			{
				var person = await _personRepository.GetByIdAsync(req.PersonId, cancellationToken)
                ?? throw new BusinessNotFoundException($"La persona {req.PersonId} no existe.");

				var role = await _roleRepository.GetByIdAsync(req.RoleId, cancellationToken)
                ?? throw new BusinessNotFoundException($"El rol {req.RoleId} no existe.");
				
				PersonByRole personByRole = new PersonByRole
				{
					Person = person,
					Role = role,
					IsActive = true
				};
				
				number.PersonByRoles.Add(personByRole);
				
			}
		}
        
        await _relations.SyncTagsAsync(number, request.Tags, cancellationToken);
        await _relations.UpdateContinuityAsync(number, request.PreviousNumberId, request.NextNumberId, cancellationToken);

        return ToDetailDto(number);