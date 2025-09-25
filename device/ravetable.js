// inlets & outlets
inlets = 2
outlets = 2
// Global current model
var cur_prior = 0;
var cur_encoder = 0;
var cur_decoder = 0;
var cur_z = 0;
// Object creation variable
var p = this.patcher

// Create a given model
function create(model_name, prior) 
{
	if (model_name == "off")
	{
		_delete_current()
		return
	}
	// Replace current model
	if (cur_encoder != 0)
		_delete_current()
	// Create encoder
	var max_encoder = p.newdefault(100, 100, "mcs.nn~", model_name, "encode");
	max_encoder.rect = [100, 100, 400, 25]
	// Create decoder
	var max_decoder = p.newdefault(100, 350, "mcs.nn~", model_name, "decode");
	max_decoder.rect = [100, 350, 850, 25]
	// Number of latents
	var n_latents = max_encoder.getboxattr('numoutlets')
	// Final models
	cur_encoder = max_encoder
	cur_decoder = max_decoder
	// Make major in / out connections
	p.connect(p.getnamed("model_props"), 0, max_encoder, 0)
	p.connect(p.getnamed("model_props"), 0, max_decoder, 0)
	p.connect(p.getnamed("plug_in"), 0, max_encoder, 0)
	p.connect(max_encoder, 0, p.getnamed("gen_interpolate"), 0)
	p.connect(p.getnamed("mc_decode"), 0, max_decoder, 0)
	p.connect(max_decoder, 0, p.getnamed("rave_out"), 0)
	// Create prior
	cur_prior = 0
	if (prior)
	{
		var max_prior = p.newdefault(100, 100, "mcs.nn~", model_name, "prior");
		max_prior.rect = [450, 100, 850, 25]
		cur_prior = max_prior
		p.connect(p.getnamed("temperature"), 0, max_prior, 0)
		p.connect(p.getnamed("model_props"), 0, max_prior, 0)
		p.connect(max_prior, 0, p.getnamed("gen_interpolate"), 1)
	}
	// Message success
	outlet(1, "create")
}

// Create a given model
function encoder(model_name, prior) 
{
	if (cur_decoder == 0)
		return
	if (cur_prior)
		p.remove(cur_prior)
	p.remove(cur_encoder)
	// Create encoder
	var max_encoder = p.newdefault(100, 100, "mcs.nn~", model_name, "encode");
	max_encoder.rect = [100, 100, 400, 25]
	// Number of latents
	var n_latents = max_encoder.getboxattr('numoutlets')
	// Decoder number of latents
	var d_latents = cur_decoder.getboxattr('numinlets')
	// Gather all 
	cur_encoder = max_encoder
	// Make major in / out connections
	p.connect(p.getnamed("model_props"), 0, max_encoder, 0)
	p.connect(p.getnamed("plug_in"), 0, max_encoder, 0)
	p.connect(max_encoder, 0, p.getnamed("gen_interpolate"), 0)
	// Create prior
	cur_prior = 0
	if (prior)
	{
		var max_prior = p.newdefault(100, 100, "mcs.nn~", model_name, "prior");
		max_prior.rect = [450, 100, 850, 25]
		cur_prior = max_prior
		p.connect(p.getnamed("model_props"), 0, max_prior, 0)
		p.connect(p.getnamed("temperature"), 0, max_prior, 0)
		p.connect(max_prior, 0, p.getnamed("gen_interpolate"), 1)
	}
	// Message success
	outlet(1, "encoder")
}


// Create a given model
function decoder(model_name) 
{
	// Replace current model
	if (cur_encoder == 0)
		return
	p.remove(cur_decoder)
	// Create decoder
	var max_decoder = p.newdefault(100, 350, "mcs.nn~", model_name, "decode");
	max_decoder.rect = [100, 350, 850, 25]
	// Decoder number of latents
	var d_latents = max_decoder.getboxattr('numinlets')
	// Number of latents
	var e_latents = cur_encoder.getboxattr('numoutlets')
	// Gather all 
	cur_decoder = max_decoder
	// Make major in / out connections
	p.connect(p.getnamed("model_props"), 0, max_decoder, 0)
	p.connect(p.getnamed("mc_decode"), 0, max_decoder, 0)
	p.connect(max_decoder, 0, p.getnamed("rave_out"), 0)
	// Message success
	outlet(1, "decoder")
}

function delete()
{
	if (cur_prior != 0)
		_delete_current()
}

// delete current model
function _delete_current()
{
	p.remove(cur_prior)
	p.remove(cur_encoder)
	p.remove(cur_decoder)
	cur_prior = 0
	cur_encoder = 0
	cur_decoder = 0
}
