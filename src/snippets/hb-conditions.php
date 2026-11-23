<?php
class ConditionResolver
{
    /** @var ConditionInterface[] type => instance */
    private $registry = [];

    /** @var Context */
    private $context;

    public function __construct(Context $context)
    {
        $this->context = $context;
        $this->registerDefaults();
    }

    /**
     * Register a custom condition type.
     * Allows third-party modules to extend the condition system.
     *
     * @param ConditionInterface $condition
     */
    public function register(ConditionInterface $condition)
    {
        $this->registry[$condition->getType()] = $condition;
    }

    /**
     * Evaluate a conditions payload (JSON string or array).
     * Returns true if all conditions pass (or if no conditions are set).
     *
     * @param string|array|null $conditionsPayload
     * @return bool
     */
    public function evaluate($conditionsPayload)
    {
        if (empty($conditionsPayload)) {
            return true;
        }

        if (is_string($conditionsPayload)) {
            $payload = json_decode($conditionsPayload, true);
            if (!is_array($payload)) {
                return true; // Invalid JSON = no restriction
            }
        } else {
            $payload = $conditionsPayload;
        }

        // Support wrapper format: {"logic": "or", "conditions": [...]}
        if (isset($payload['logic']) && isset($payload['conditions'])) {
            return $this->evaluateGroup(
                $payload['conditions'],
                $payload['logic']
            );
        }

