local suspicion: { [Player]: number } = {}

local function allow(player: Player, name: string): boolean
	local rate = RATES[name] or DEFAULT_RATE
	local perPlayer = buckets[player]
	if not perPlayer then
		perPlayer = {}
		buckets[player] = perPlayer
	end
	local now = os.clock()
	local b = perPlayer[name]
	if not b then
		b = { tokens = rate.capacity, at = now }
		perPlayer[name] = b
	end
	b.tokens = math.min(rate.capacity, b.tokens + (now - b.at) * rate.refillPerSecond)
	b.at = now
	if b.tokens < 1 then
		return false
	end
	b.tokens -= 1
	return true
end

